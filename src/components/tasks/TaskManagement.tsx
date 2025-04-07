
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Calendar, Clock, AlertCircle, Check, Trash, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  priority: string;
  assigned_to: string | null;
  related_to: string | null;
  related_id: string | null;
  created_at: string;
  updated_at: string;
}

const TaskManagement = () => {
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "medium",
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const fetchTasks = async () => {
    if (!businessProfile) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('business_id', businessProfile.id)
        .order('due_date', { ascending: true, nullsLast: true });
      
      if (error) throw error;
      
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [businessProfile]);
  
  const handleCreateTask = async () => {
    if (!businessProfile || !newTask.title.trim()) {
      toast.error('Please provide a task title');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          business_id: businessProfile.id,
          title: newTask.title,
          priority: newTask.priority
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setTasks([data, ...tasks]);
      setNewTask({ title: "", priority: "medium" });
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };
  
  const handleUpdateTaskStatus = async (task: Task, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', task.id);
      
      if (error) throw error;
      
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status } : t));
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };
  
  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };
  
  const handleEditTask = async () => {
    if (!editingTask) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTask.id);
      
      if (error) throw error;
      
      setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "pending") return task.status === "pending";
    if (filter === "completed") return task.status === "completed";
    if (filter === "high") return task.priority === "high";
    return true;
  });
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Management</h2>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending Tasks</SelectItem>
              <SelectItem value="completed">Completed Tasks</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* New Task Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="new-task">Task Title</Label>
              <Input
                id="new-task"
                placeholder="Enter task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="w-[150px]">
              <Label htmlFor="new-task-priority">Priority</Label>
              <Select 
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger id="new-task-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateTask} className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Task List */}
      <div className="space-y-4">
        <h3 className="font-medium">Tasks ({filteredTasks.length})</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  {editingTask && editingTask.id === task.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                        className="font-medium"
                      />
                      <div className="flex flex-wrap gap-2">
                        <div className="w-[150px]">
                          <Select 
                            value={editingTask.priority}
                            onValueChange={(value) => setEditingTask({ ...editingTask, priority: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleEditTask}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingTask(null)}>Cancel</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status === "completed" ? "Completed" : "Pending"}
                          </Badge>
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {task.status !== "completed" && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-green-600 hover:text-green-500"
                            onClick={() => handleUpdateTaskStatus(task, "completed")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-500"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-600 hover:text-red-500"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No tasks found. Create a new task to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;
