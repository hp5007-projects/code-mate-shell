import { windowsFileSystem } from './fileSystem';

export interface CommandResult {
  output: string;
  success: boolean;
  error?: string;
}

// System monitoring simulation
const getSystemInfo = () => ({
  cpu: Math.floor(Math.random() * 100),
  memory: {
    total: 16384,
    used: Math.floor(Math.random() * 12000) + 2000,
    available: 0
  },
  processes: [
    { pid: 1234, name: 'explorer.exe', cpu: 2.1, memory: 45.2 },
    { pid: 5678, name: 'chrome.exe', cpu: 15.3, memory: 234.8 },
    { pid: 9012, name: 'code.exe', cpu: 8.7, memory: 156.4 },
    { pid: 3456, name: 'python.exe', cpu: 1.2, memory: 23.6 },
    { pid: 7890, name: 'node.exe', cpu: 4.5, memory: 67.2 },
    { pid: 2468, name: 'cmd.exe', cpu: 0.3, memory: 5.8 },
    { pid: 1357, name: 'notepad.exe', cpu: 0.1, memory: 8.2 }
  ]
});

export const executeCommand = (command: string, args: string[]): CommandResult => {
  const cmd = command.toLowerCase();
  
  switch (cmd) {
    case 'dir':
    case 'ls':
      const dirResult = windowsFileSystem.listDirectory(args[0]);
      return {
        output: dirResult.success ? dirResult.content : dirResult.message,
        success: dirResult.success,
        error: dirResult.success ? undefined : dirResult.message
      };

    case 'cd':
      if (args.length === 0) {
        return {
          output: windowsFileSystem.getCurrentPath(),
          success: true
        };
      }
      const cdResult = windowsFileSystem.changeDirectory(args[0]);
      return {
        output: cdResult.success ? '' : cdResult.message,
        success: cdResult.success,
        error: cdResult.success ? undefined : cdResult.message
      };

    case 'pwd':
      return {
        output: windowsFileSystem.getCurrentPath(),
        success: true
      };

    case 'mkdir':
    case 'md':
      if (args.length === 0) {
        return {
          output: '',
          success: false,
          error: 'The syntax of the command is incorrect.'
        };
      }
      const mkdirResult = windowsFileSystem.makeDirectory(args[0]);
      return {
        output: mkdirResult.success ? '' : mkdirResult.message,
        success: mkdirResult.success,
        error: mkdirResult.success ? undefined : mkdirResult.message
      };

    case 'rmdir':
    case 'rd':
    case 'del':
    case 'rm':
      if (args.length === 0) {
        return {
          output: '',
          success: false,
          error: 'The syntax of the command is incorrect.'
        };
      }
      const rmResult = windowsFileSystem.remove(args[0], args.includes('/s') || args.includes('-rf'));
      return {
        output: rmResult.success ? '' : rmResult.message,
        success: rmResult.success,
        error: rmResult.success ? undefined : rmResult.message
      };

    case 'type':
    case 'cat':
      if (args.length === 0) {
        return {
          output: '',
          success: false,
          error: 'The syntax of the command is incorrect.'
        };
      }
      const typeResult = windowsFileSystem.getFileContent(args[0]);
      return {
        output: typeResult.success ? typeResult.content : typeResult.message,
        success: typeResult.success,
        error: typeResult.success ? undefined : typeResult.message
      };

    case 'echo':
      return {
        output: args.join(' '),
        success: true
      };

    case 'copy':
    case 'cp':
      if (args.length < 2) {
        return {
          output: '',
          success: false,
          error: 'The syntax of the command is incorrect.'
        };
      }
      const copyResult = windowsFileSystem.copyFile(args[0], args[1]);
      return {
        output: copyResult.success ? `        1 file(s) copied.` : copyResult.message,
        success: copyResult.success,
        error: copyResult.success ? undefined : copyResult.message
      };

    case 'tree':
      const treeOutput = windowsFileSystem.getDirectoryTree();
      return {
        output: `Folder PATH listing for volume Windows\nVolume serial number is 1A2B-3C4D\n${windowsFileSystem.getCurrentPath()}\n${treeOutput}`,
        success: true
      };

    case 'tasklist':
    case 'ps':
      const sysInfo = getSystemInfo();
      let processOutput = `\nImage Name                     PID Session Name        Session#    Mem Usage\n`;
      processOutput += `========================= ======== ================ =========== ============\n`;
      
      sysInfo.processes.forEach(proc => {
        const imageName = proc.name.padEnd(25);
        const pid = proc.pid.toString().padStart(8);
        const sessionName = 'Console'.padEnd(16);
        const sessionNum = '1'.padStart(11);
        const memUsage = `${proc.memory.toFixed(1)} MB`.padStart(12);
        processOutput += `${imageName} ${pid} ${sessionName} ${sessionNum} ${memUsage}\n`;
      });
      
      return {
        output: processOutput,
        success: true
      };

    case 'systeminfo':
    case 'cpu':
      const cpuInfo = getSystemInfo();
      return {
        output: `\nHost Name:                 CODEMATE-PC\nOS Name:                   Microsoft Windows 11 Pro\nOS Version:                10.0.22621 N/A Build 22621\nProcessor(s):              1 Processor(s) Installed.\n                          [01]: Intel64 Family 6 Model 142 Stepping 12 GenuineIntel ~2.80 GHz\nTotal Physical Memory:     ${cpuInfo.memory.total} MB\nAvailable Physical Memory: ${cpuInfo.memory.total - cpuInfo.memory.used} MB\nCPU Usage:                 ${cpuInfo.cpu}%`,
        success: true
      };

    case 'mem':
    case 'memory':
      const memInfo = getSystemInfo();
      const usedPercent = ((memInfo.memory.used / memInfo.memory.total) * 100).toFixed(1);
      return {
        output: `\nMemory Status:\nTotal Physical Memory:     ${memInfo.memory.total.toLocaleString()} MB\nUsed Physical Memory:      ${memInfo.memory.used.toLocaleString()} MB (${usedPercent}%)\nAvailable Physical Memory: ${(memInfo.memory.total - memInfo.memory.used).toLocaleString()} MB`,
        success: true
      };

    case 'cls':
    case 'clear':
      return {
        output: 'CLEAR_SCREEN',
        success: true
      };

    case 'help':
      return {
        output: `Available Commands:\n\nDIR [path]     - Display directory contents\nCD [path]      - Change current directory\nMKDIR name     - Create directory\nRMDIR name     - Remove directory\nTYPE file      - Display file contents\nCOPY src dest  - Copy file\nDEL file       - Delete file\nTREE           - Display directory tree\nTASKLIST       - List running processes\nSYSTEMINFO     - Display system information\nMEM            - Display memory usage\nECHO text      - Display text\nCLS            - Clear screen\nHELP           - Show this help\nEXIT           - Close terminal\n\nNatural Language Commands:\nTry: "show files", "create folder test", "go to Documents"`,
        success: true
      };

    case 'ver':
    case 'version':
      return {
        output: `\nMicrosoft Windows [Version 10.0.22621.2428]\nCodeMate Terminal Emulator v1.0.0`,
        success: true
      };

    case 'date':
      return {
        output: `The current date is: ${new Date().toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        })}`,
        success: true
      };

    case 'time':
      return {
        output: `The current time is: ${new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          hour12: true 
        })}`,
        success: true
      };

    case 'exit':
      return {
        output: 'Goodbye!',
        success: true
      };

    case 'history':
      // This will be handled by the terminal component
      return {
        output: 'SHOW_HISTORY',
        success: true
      };

    case 'whoami':
      return {
        output: 'CODEMATE\\Administrator',
        success: true
      };

    case 'hostname':
      return {
        output: 'CODEMATE-PC',
        success: true
      };

    default:
      // Simulate subprocess for unrecognized commands
      if (command.trim()) {
        return {
          output: '',
          success: false,
          error: `'${command}' is not recognized as an internal or external command,\noperable program or batch file.`
        };
      }
      return {
        output: '',
        success: true
      };
  }
};