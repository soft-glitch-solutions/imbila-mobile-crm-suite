
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Save, Trash } from "lucide-react";
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
  business_id: string;
}

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchTask = async () => {
      if (!businessProfile || !id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessProfile.id)
          .single();
        
        if (error) throw error;
        
        setTask(data as Task);
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Failed to load task information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTask();
  }, [id, businessProfile]);
  
  const handleChange = (field: keyof Task, value: string | null) => {
    if (!task) return;
    
    setTask({
      ...task,
      [field]: value
    });
  };
  
  const handleSave = async () => {
    if (!task || !businessProfile) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          assigned_to: task.assigned_to,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);
        
      if (error) throw error;
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!task || !businessProfile) return;
    
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
        
      if (error) throw error;
      
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-10">
        <p className="mb-4">Task not found.</p>
        <Button onClick={() => navigate('/tasks')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/tasks')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDelete} disabled={isSaving}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title"
                value={task.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={task.status} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={task.priority} 
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="assigned">Assigned To</Label>
              <Input 
                id="assigned"
                value={task.assigned_to || ''}
                onChange={(e) => handleChange('assigned_to', e.target.value || null)}
                placeholder="Enter assignee name"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={task.description || ''}
                onChange={(e) => handleChange('description', e.target.value || null)}
                rows={4}
              />
            </div>
            
            <div>
              <Label className="mb-2 block">Created</Label>
              <div className="text-sm text-gray-500 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(task.created_at), 'PPP')}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span>{format(new Date(task.created_at), 'p')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetails;
