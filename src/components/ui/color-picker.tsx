
import { useState } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const ColorPicker = ({ value, onChange, label }: ColorPickerProps) => {
  const [color, setColor] = useState(value || "#000000");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="flex flex-col space-y-1.5">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-md border"
          style={{ backgroundColor: color }}
        />
        <Input
          type="text"
          value={color}
          onChange={(e) => handleChange(e)}
          className="w-full"
        />
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1 rounded-md border"
              aria-label="Pick a color"
            >
              🎨
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="p-2">
              <Input
                type="color"
                value={color}
                onChange={handleChange}
                className="w-full h-10"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
