import { Button } from "@/components/ui/button";
import { Terminal, Folder, Chrome, Settings } from "lucide-react";

export const WindowsTaskbar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[hsl(210,11%,15%)] to-[hsl(210,11%,20%)] border-t border-[hsl(210,11%,25%)] flex items-center px-2 z-50">
      {/* Start Button */}
      <Button
        variant="ghost"
        className="h-10 w-12 p-0 hover:bg-windows-button-hover rounded-sm mr-2"
      >
        <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm" />
        </div>
      </Button>
      
      {/* App Icons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          className="h-10 w-12 p-0 hover:bg-windows-button-hover rounded-sm bg-windows-button-hover/50"
        >
          <Terminal className="w-5 h-5 text-windows-titlebar-text" />
        </Button>
        <Button
          variant="ghost"
          className="h-10 w-12 p-0 hover:bg-windows-button-hover rounded-sm"
        >
          <Folder className="w-5 h-5 text-windows-titlebar-text" />
        </Button>
        <Button
          variant="ghost"
          className="h-10 w-12 p-0 hover:bg-windows-button-hover rounded-sm"
        >
          <Chrome className="w-5 h-5 text-windows-titlebar-text" />
        </Button>
      </div>
      
      {/* System Tray */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-windows-button-hover rounded-sm"
        >
          <Settings className="w-4 h-4 text-windows-titlebar-text" />
        </Button>
        
        {/* Clock */}
        <div className="text-windows-titlebar-text text-sm px-2 py-1 hover:bg-windows-button-hover rounded-sm cursor-pointer">
          <div className="text-center leading-tight">
            <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs opacity-75">{new Date().toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>
      </div>
    </div>
  );
};