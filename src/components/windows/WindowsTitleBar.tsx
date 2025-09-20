import { Minus, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WindowsTitleBarProps {
  title: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export const WindowsTitleBar = ({ title, onMinimize, onMaximize, onClose }: WindowsTitleBarProps) => {
  return (
    <div className="bg-windows-titlebar text-windows-titlebar-text h-8 flex items-center justify-between px-3 select-none">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-sm" />
        </div>
        <span className="text-sm font-normal">{title}</span>
      </div>
      
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-11 p-0 hover:bg-windows-button-hover text-windows-titlebar-text hover:text-white rounded-none"
          onClick={onMinimize}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-11 p-0 hover:bg-windows-button-hover text-windows-titlebar-text hover:text-white rounded-none"
          onClick={onMaximize}
        >
          <Square className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-11 p-0 hover:bg-windows-button-close-hover text-windows-titlebar-text hover:text-white rounded-none"
          onClick={onClose}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};