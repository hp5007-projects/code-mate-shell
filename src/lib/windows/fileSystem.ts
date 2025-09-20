// Windows File System Simulation
class WindowsFileSystem {
  private currentPath: string = "C:\\Users\\Administrator";
  private fileSystem: Record<string, any> = {
    "C:": {
      "Users": {
        "Administrator": {
          "Desktop": {},
          "Documents": {
            "projects": {
              "hackathon": {
                "README.md": "# CodeMate Hackathon Project\n\nThis is a Windows-style terminal project.",
                "app.py": "from flask import Flask\napp = Flask(__name__)",
                "requirements.txt": "Flask==2.0.1\npsutil==5.8.0"
              }
            },
            "report.txt": "Quarterly report data..."
          },
          "Downloads": {},
          "Pictures": {},
          "Music": {},
          "Videos": {}
        },
        "Public": {
          "Documents": {},
          "Desktop": {}
        }
      },
      "Windows": {
        "System32": {
          "drivers": {}
        },
        "Temp": {}
      },
      "Program Files": {
        "CodeMate": {
          "bin": {},
          "config": {}
        },
        "Python": {
          "Scripts": {},
          "Lib": {}
        },
        "Microsoft Office": {}
      },
      "ProgramData": {}
    },
    "D:": {
      "Backup": {
        "2024": {}
      },
      "Games": {
        "Steam": {}
      },
      "Data": {}
    }
  };

  getCurrentPath(): string {
    return this.currentPath;
  }

  getDriveLetter(): string {
    return this.currentPath.split(":")[0] + ":";
  }

  private resolvePath(path: string): string {
    if (path.includes(":")) {
      return path;
    }
    if (path === "..") {
      const parts = this.currentPath.split("\\");
      parts.pop();
      return parts.length > 1 ? parts.join("\\") : this.getDriveLetter();
    }
    if (path.startsWith("..\\")) {
      const parts = this.currentPath.split("\\");
      parts.pop();
      const remaining = path.substring(3);
      return (parts.length > 1 ? parts.join("\\") : this.getDriveLetter()) + "\\" + remaining;
    }
    if (path.startsWith("\\")) {
      return this.getDriveLetter() + path;
    }
    return this.currentPath + "\\" + path;
  }

  private getNode(path: string): any {
    const parts = path.split("\\").filter(p => p);
    let current = this.fileSystem;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        return null;
      }
      current = current[part];
    }
    return current;
  }

  changeDirectory(path: string): { success: boolean; message: string } {
    const resolvedPath = this.resolvePath(path);
    const node = this.getNode(resolvedPath);
    
    if (node === null) {
      return { success: false, message: `The system cannot find the path specified.` };
    }
    
    if (typeof node === 'string') {
      return { success: false, message: `The directory name is invalid.` };
    }
    
    this.currentPath = resolvedPath;
    return { success: true, message: "" };
  }

  listDirectory(path?: string, detailed: boolean = false): { success: boolean; content: string; message: string } {
    const targetPath = path ? this.resolvePath(path) : this.currentPath;
    const node = this.getNode(targetPath);
    
    if (node === null) {
      return { success: false, content: "", message: `File Not Found` };
    }
    
    if (typeof node === 'string') {
      return { success: false, content: "", message: `The filename, directory name, or volume label syntax is incorrect.` };
    }

    const entries = Object.entries(node);
    if (entries.length === 0) {
      return { 
        success: true, 
        content: ` Volume in drive ${this.getDriveLetter().charAt(0)} has no label.\n Volume Serial Number is 1A2B-3C4D\n\n Directory of ${targetPath}\n\n<DIR>          .\n<DIR>          ..\n               0 File(s)                  0 bytes\n               2 Dir(s)  999,999,999,999 bytes free`, 
        message: "" 
      };
    }

    let output = ` Volume in drive ${this.getDriveLetter().charAt(0)} has no label.\n Volume Serial Number is 1A2B-3C4D\n\n Directory of ${targetPath}\n\n`;
    output += `<DIR>          .\n<DIR>          ..\n`;
    
    entries.forEach(([name, content]) => {
      const isDir = typeof content === 'object';
      if (isDir) {
        output += `<DIR>          ${name}\n`;
      } else {
        const size = (typeof content === 'string' ? content.length : 0).toString().padStart(14);
        const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        output += `${date}  ${time}${size} ${name}\n`;
      }
    });
    
    const fileCount = entries.filter(([, content]) => typeof content === 'string').length;
    const dirCount = entries.filter(([, content]) => typeof content === 'object').length;
    const totalBytes = entries
      .filter(([, content]) => typeof content === 'string')
      .reduce((sum, [, content]) => sum + (typeof content === 'string' ? content.length : 0), 0);
    
    output += `\n               ${fileCount} File(s)     ${totalBytes.toLocaleString()} bytes\n`;
    output += `               ${dirCount + 2} Dir(s)  999,999,999,999 bytes free`;
    
    return { success: true, content: output, message: "" };
  }

  makeDirectory(name: string): { success: boolean; message: string } {
    const node = this.getNode(this.currentPath);
    if (node === null) {
      return { success: false, message: "The system cannot find the path specified." };
    }
    
    if (node[name] !== undefined) {
      return { success: false, message: `A subdirectory or file ${name} already exists.` };
    }
    
    node[name] = {};
    return { success: true, message: "" };
  }

  remove(name: string, recursive: boolean = false): { success: boolean; message: string } {
    const node = this.getNode(this.currentPath);
    if (node === null) {
      return { success: false, message: "The system cannot find the path specified." };
    }
    
    if (node[name] === undefined) {
      return { success: false, message: `Could Not Find ${this.currentPath}\\${name}` };
    }
    
    // Safety check for important directories
    const dangerousPaths = ['Windows', 'System32', 'Program Files', 'Users'];
    if (dangerousPaths.includes(name) && this.currentPath.includes('C:')) {
      return { success: false, message: `Access is denied.` };
    }
    
    const target = node[name];
    if (typeof target === 'object' && Object.keys(target).length > 0 && !recursive) {
      return { success: false, message: `The directory is not empty.` };
    }
    
    delete node[name];
    return { success: true, message: "" };
  }

  getFileContent(filename: string): { success: boolean; content: string; message: string } {
    const node = this.getNode(this.currentPath);
    if (node === null) {
      return { success: false, content: "", message: "The system cannot find the path specified." };
    }
    
    if (node[filename] === undefined) {
      return { success: false, content: "", message: `The system cannot find the file specified.` };
    }
    
    if (typeof node[filename] === 'object') {
      return { success: false, content: "", message: `Access is denied.` };
    }
    
    return { success: true, content: node[filename], message: "" };
  }

  createFile(filename: string, content: string = ""): { success: boolean; message: string } {
    const node = this.getNode(this.currentPath);
    if (node === null) {
      return { success: false, message: "The system cannot find the path specified." };
    }
    
    node[filename] = content;
    return { success: true, message: "" };
  }

  copyFile(source: string, destination: string): { success: boolean; message: string } {
    const fileResult = this.getFileContent(source);
    if (!fileResult.success) {
      return fileResult;
    }
    
    return this.createFile(destination, fileResult.content);
  }

  getDirectoryTree(path?: string, prefix: string = ""): string {
    const targetPath = path || this.currentPath;
    const node = this.getNode(targetPath);
    
    if (!node || typeof node === 'string') {
      return "";
    }
    
    let result = "";
    const entries = Object.entries(node);
    
    entries.forEach(([name, content], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const isDir = typeof content === 'object';
      
      result += `${prefix}${connector}${name}${isDir ? '/' : ''}\n`;
      
      if (isDir && Object.keys(content).length > 0) {
        const newPrefix = prefix + (isLast ? "    " : "│   ");
        result += this.getDirectoryTree(targetPath + "\\" + name, newPrefix);
      }
    });
    
    return result;
  }
}

export const windowsFileSystem = new WindowsFileSystem();