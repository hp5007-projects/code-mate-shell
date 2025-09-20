import { WindowsDesktop } from "@/components/windows/WindowsDesktop";
import { WindowsTaskbar } from "@/components/windows/WindowsTaskbar";
import { WindowsTerminalWindow } from "@/components/windows/WindowsTerminalWindow";
import { WindowsTerminal } from "@/components/WindowsTerminal";

const Index = () => {
  return (
    <WindowsDesktop>
      <div className="min-h-screen flex items-center justify-center p-4">
        <WindowsTerminalWindow title="Administrator: Command Prompt">
          <WindowsTerminal />
        </WindowsTerminalWindow>
      </div>
      <WindowsTaskbar />
    </WindowsDesktop>
  );
};

export default Index;
