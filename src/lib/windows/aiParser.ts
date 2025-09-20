// AI-powered Natural Language Command Parser
export interface ParseResult {
  command: string;
  args: string[];
  confidence: number;
  explanation: string;
}

const nlpPatterns = [
  // Directory operations
  { pattern: /(?:show|list|display)\s+(?:files?|contents?|directory)/i, command: 'dir', confidence: 0.9 },
  { pattern: /(?:go\s+to|change\s+to|navigate\s+to|cd\s+to)\s+(.+)/i, command: 'cd', confidence: 0.9, argIndex: 1 },
  { pattern: /(?:create|make|new)\s+(?:folder|directory)\s+(.+)/i, command: 'mkdir', confidence: 0.9, argIndex: 1 },
  { pattern: /(?:delete|remove|rm)\s+(?:folder|directory)\s+(.+)/i, command: 'rmdir', confidence: 0.8, argIndex: 1 },
  { pattern: /(?:current|working)\s+(?:directory|folder|path)/i, command: 'pwd', confidence: 0.9 },
  
  // File operations
  { pattern: /(?:show|display|read|type|cat)\s+(?:file\s+)?(.+)/i, command: 'type', confidence: 0.8, argIndex: 1 },
  { pattern: /(?:create|make|new)\s+(?:file)\s+(.+)/i, command: 'echo', confidence: 0.7, argIndex: 1, customArgs: ['>', '$1'] },
  { pattern: /(?:copy|duplicate)\s+(.+)\s+(?:to|as)\s+(.+)/i, command: 'copy', confidence: 0.8, argIndex: [1, 2] },
  { pattern: /(?:delete|remove|rm)\s+(?:file\s+)?(.+)/i, command: 'del', confidence: 0.8, argIndex: 1 },
  
  // System operations
  { pattern: /(?:show|display|list)\s+(?:processes|running|tasks)/i, command: 'tasklist', confidence: 0.9 },
  { pattern: /(?:show|display)\s+(?:cpu|processor)\s+(?:usage|info)/i, command: 'systeminfo', confidence: 0.9 },
  { pattern: /(?:show|display)\s+(?:memory|ram)\s+(?:usage|info)/i, command: 'mem', confidence: 0.9 },
  { pattern: /(?:system|computer)\s+(?:info|information)/i, command: 'systeminfo', confidence: 0.8 },
  
  // General commands
  { pattern: /(?:clear|clean)\s+(?:screen|terminal|console)/i, command: 'cls', confidence: 0.9 },
  { pattern: /(?:show|display)\s+(?:tree|structure)/i, command: 'tree', confidence: 0.8 },
  { pattern: /(?:help|commands|what\s+can)/i, command: 'help', confidence: 0.9 },
  { pattern: /(?:current|show)\s+(?:time|clock)/i, command: 'time', confidence: 0.9 },
  { pattern: /(?:current|show|today)\s+(?:date|day)/i, command: 'date', confidence: 0.9 },
  
  // Advanced patterns
  { pattern: /(?:list|show)\s+(.+)\s+(?:files?|contents?)/i, command: 'dir', confidence: 0.7, argIndex: 1 },
  { pattern: /(?:go|move|switch)\s+(?:back|up|parent)/i, command: 'cd', confidence: 0.8, customArgs: ['..'] },
  { pattern: /(?:echo|print|say)\s+(.+)/i, command: 'echo', confidence: 0.8, argIndex: 1 },
  
  // More Windows-specific patterns
  { pattern: /(?:who\s+am\s+i|current\s+user)/i, command: 'whoami', confidence: 0.9 },
  { pattern: /(?:computer\s+name|host\s+name|machine\s+name)/i, command: 'hostname', confidence: 0.9 },
  { pattern: /(?:show|display|list)\s+(?:history|previous|past)\s+(?:commands?)/i, command: 'history', confidence: 0.9 },
  { pattern: /(?:what\s+version|windows\s+version|system\s+version)/i, command: 'ver', confidence: 0.9 },
  
  // File content patterns
  { pattern: /(?:read|open|view)\s+(.+)/i, command: 'type', confidence: 0.7, argIndex: 1 },
  { pattern: /(?:make|create|touch)\s+(?:file\s+)?(.+)/i, command: 'echo', confidence: 0.6, customArgs: ['>', '$1'] },
  
  // Directory navigation
  { pattern: /(?:go\s+)?(?:home|back\s+home)/i, command: 'cd', confidence: 0.8, customArgs: ['C:\\Users\\Administrator'] },
  { pattern: /(?:go\s+to\s+)?(?:desktop)/i, command: 'cd', confidence: 0.8, customArgs: ['Desktop'] },
  { pattern: /(?:go\s+to\s+)?(?:documents)/i, command: 'cd', confidence: 0.8, customArgs: ['Documents'] },
  { pattern: /(?:go\s+to\s+)?(?:downloads)/i, command: 'cd', confidence: 0.8, customArgs: ['Downloads'] },
];

export function parseNaturalLanguage(input: string): ParseResult {
  const trimmedInput = input.trim();
  
  // First check if it's already a valid command
  const commandWords = trimmedInput.split(/\s+/);
  const firstWord = commandWords[0].toLowerCase();
  const validCommands = ['dir', 'cd', 'pwd', 'mkdir', 'rmdir', 'type', 'copy', 'del', 'tree', 'tasklist', 'systeminfo', 'mem', 'cls', 'help', 'echo', 'time', 'date', 'exit'];
  
  if (validCommands.includes(firstWord)) {
    return {
      command: trimmedInput,
      args: [],
      confidence: 1.0,
      explanation: "Direct command recognized"
    };
  }
  
  // Try to match natural language patterns
  for (const pattern of nlpPatterns) {
    const match = trimmedInput.match(pattern.pattern);
    
    if (match) {
      let args: string[] = [];
      
      if (pattern.customArgs) {
        args = pattern.customArgs.map(arg => 
          arg.startsWith('$') ? match[parseInt(arg.substring(1))] || '' : arg
        );
      } else if (pattern.argIndex) {
        if (Array.isArray(pattern.argIndex)) {
          args = pattern.argIndex.map(index => match[index] || '').filter(arg => arg);
        } else {
          const arg = match[pattern.argIndex];
          if (arg) args.push(arg);
        }
      }
      
      // Clean up arguments
      args = args.map(arg => arg.trim().replace(/['"]/g, '')).filter(arg => arg);
      
      const commandWithArgs = args.length > 0 ? `${pattern.command} ${args.join(' ')}` : pattern.command;
      
      return {
        command: commandWithArgs,
        args: args,
        confidence: pattern.confidence,
        explanation: `Interpreted "${trimmedInput}" as "${commandWithArgs}"`
      };
    }
  }
  
  // If no pattern matches, return as-is with low confidence
  return {
    command: trimmedInput,
    args: [],
    confidence: 0.1,
    explanation: "Command not recognized - executing as-is"
  };
}

// Get command suggestions for autocomplete
export function getCommandSuggestions(partial: string): string[] {
  const commands = [
    'dir', 'cd', 'pwd', 'mkdir', 'rmdir', 'type', 'copy', 'del', 'tree', 
    'tasklist', 'systeminfo', 'mem', 'cls', 'help', 'echo', 'time', 'date', 'exit'
  ];
  
  const naturalSuggestions = [
    'show files',
    'create folder',
    'go to Documents',
    'show memory usage',
    'list processes',
    'current directory',
    'clear screen',
    'show cpu usage',
    'display tree structure'
  ];
  
  const allSuggestions = [...commands, ...naturalSuggestions];
  
  if (!partial) return allSuggestions;
  
  const lowerPartial = partial.toLowerCase();
  return allSuggestions.filter(cmd => 
    cmd.toLowerCase().startsWith(lowerPartial) || 
    cmd.toLowerCase().includes(lowerPartial)
  ).slice(0, 10);
}

// Get contextual help for commands
export function getCommandHelp(command: string): string {
  const helpMap: Record<string, string> = {
    'dir': 'DIR [path] - Display directory contents\nExample: dir, dir Documents',
    'cd': 'CD [path] - Change current directory\nExample: cd Documents, cd ..',
    'pwd': 'PWD - Display current directory path',
    'mkdir': 'MKDIR <name> - Create a new directory\nExample: mkdir newfolder',
    'rmdir': 'RMDIR <name> - Remove a directory\nExample: rmdir oldfolder',
    'type': 'TYPE <file> - Display file contents\nExample: type readme.txt',
    'copy': 'COPY <source> <destination> - Copy a file\nExample: copy file1.txt file2.txt',
    'del': 'DEL <file> - Delete a file\nExample: del oldfile.txt',
    'tree': 'TREE - Display directory structure as a tree',
    'tasklist': 'TASKLIST - List all running processes',
    'systeminfo': 'SYSTEMINFO - Display system information including CPU usage',
    'mem': 'MEM - Display memory usage information',
    'cls': 'CLS - Clear the terminal screen',
    'echo': 'ECHO <text> - Display text\nExample: echo Hello World',
    'help': 'HELP - Display available commands',
    'time': 'TIME - Display current time',
    'date': 'DATE - Display current date',
    'exit': 'EXIT - Close the terminal'
  };
  
  return helpMap[command.toLowerCase()] || 'Command not found. Type "help" for available commands.';
}