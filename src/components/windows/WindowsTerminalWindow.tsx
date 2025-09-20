import { ReactNode, useState } from "react";
import { WindowsTitleBar } from "./WindowsTitleBar";

interface WindowsTerminalWindowProps {
  children: ReactNode;
  title?: string;
}

export const WindowsTerminalWindow = ({ children, title = "Command Prompt" }: WindowsTerminalWindowProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (isMinimized) {
    return null;
  }

  return (
    <div 
      className={`
        bg-card border border-border rounded-sm overflow-hidden shadow-2xl
        ${isMaximized 
          ? 'fixed inset-4 bottom-16' 
          : 'w-full max-w-4xl mx-auto mt-8 mb-16 min-h-[600px]'
        }
        transition-all duration-200
      `}
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)" }}
    >
      <WindowsTitleBar
        title={title}
        onMinimize={() => setIsMinimized(true)}
        onMaximize={() => setIsMaximized(!isMaximized)}
        onClose={() => setIsMinimized(true)}
      />
      
      <div className="h-full bg-windows-terminal-bg">
        {children}
      </div>
    </div>
  );
};