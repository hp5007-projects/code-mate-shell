import { ReactNode } from "react";

interface WindowsDesktopProps {
  children: ReactNode;
}

export const WindowsDesktop = ({ children }: WindowsDesktopProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-windows-desktop to-windows-desktop-end relative overflow-hidden">
      {/* Desktop Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 space-y-4">
        <div className="flex flex-col items-center text-white cursor-pointer hover:bg-white/10 p-2 rounded">
          <div className="w-8 h-8 bg-yellow-500 rounded mb-1 flex items-center justify-center">
            <span className="text-xs font-bold">📁</span>
          </div>
          <span className="text-xs text-center">This PC</span>
        </div>
        
        <div className="flex flex-col items-center text-white cursor-pointer hover:bg-white/10 p-2 rounded">
          <div className="w-8 h-8 bg-blue-500 rounded mb-1 flex items-center justify-center">
            <span className="text-xs font-bold">🗑️</span>
          </div>
          <span className="text-xs text-center">Recycle Bin</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 pb-12">
        {children}
      </div>
    </div>
  );
};