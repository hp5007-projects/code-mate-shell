import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { executeCommand } from '@/lib/windows/commands';
import { parseNaturalLanguage, getCommandSuggestions } from '@/lib/windows/aiParser';
import { windowsFileSystem } from '@/lib/windows/fileSystem';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TerminalEntry {
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

export const WindowsTerminal = () => {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const suggestionIndex = useRef(0);

  useEffect(() => {
    // Welcome message
    setEntries([{
      type: 'info',
      content: `Microsoft Windows [Version 10.0.22621.2428]\n(c) Microsoft Corporation. All rights reserved.\n\nCodeMate Terminal Emulator - Hackathon Project\nType "help" for available commands or try natural language like "show files"\n`,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [entries]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addEntry = (type: TerminalEntry['type'], content: string) => {
    setEntries(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const executeTerminalCommand = async (input: string) => {
    if (!input.trim()) return;

    setIsProcessing(true);
    
    // Add command to history
    if (commandHistory[commandHistory.length - 1] !== input) {
      setCommandHistory(prev => [...prev, input]);
    }
    setHistoryIndex(-1);

    // Show command being executed
    addEntry('command', `${windowsFileSystem.getCurrentPath()}>${input}`);

    // Parse natural language if needed
    const parseResult = parseNaturalLanguage(input);
    
    if (parseResult.confidence < 1.0 && parseResult.confidence > 0.5) {
      addEntry('info', `💡 ${parseResult.explanation}`);
    }

    // Execute the command
    const [command, ...args] = parseResult.command.split(/\s+/);
    const result = executeCommand(command, args);

    // Handle special commands
    if (result.output === 'CLEAR_SCREEN') {
      setEntries([]);
      setIsProcessing(false);
      return;
    }

    if (result.output === 'SHOW_HISTORY') {
      const historyOutput = commandHistory.length === 0 ? 
        'No commands in history.' : 
        commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
      addEntry('output', historyOutput);
      setIsProcessing(false);
      return;
    }

    // Add result
    if (result.success) {
      if (result.output) {
        addEntry('output', result.output);
      }
    } else {
      addEntry('error', result.error || 'Command failed');
    }

    setIsProcessing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeTerminalCommand(currentInput);
      setCurrentInput('');
      setShowSuggestions(false);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        suggestionIndex.current = Math.max(0, suggestionIndex.current - 1);
      } else if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        suggestionIndex.current = Math.min(suggestions.length - 1, suggestionIndex.current + 1);
      } else if (historyIndex !== -1) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : -1;
        setHistoryIndex(newIndex);
        setCurrentInput(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setCurrentInput(suggestions[suggestionIndex.current]);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    
    if (value.trim()) {
      const newSuggestions = getCommandSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      suggestionIndex.current = 0;
    } else {
      setShowSuggestions(false);
    }
  };

  const formatOutput = (content: string) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className="font-mono text-sm leading-relaxed">
        {line || '\u00A0'}
      </div>
    ));
  };

  const getCurrentPrompt = () => {
    return `${windowsFileSystem.getCurrentPath()}>`;
  };

  return (
    <div className="h-full flex flex-col bg-windows-terminal-bg text-windows-terminal-text windows-console">
      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-track-windows-terminal-bg scrollbar-thumb-gray-600"
      >
        {entries.map((entry, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {entry.type === 'command' && (
              <div className="text-windows-terminal-text">
                {formatOutput(entry.content)}
              </div>
            )}
            {entry.type === 'output' && (
              <div className="text-windows-terminal-text">
                {formatOutput(entry.content)}
              </div>
            )}
            {entry.type === 'error' && (
              <div className="text-windows-terminal-error">
                {formatOutput(entry.content)}
              </div>
            )}
            {entry.type === 'info' && (
              <div className="text-windows-terminal-info">
                {formatOutput(entry.content)}
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
          <div className="text-windows-terminal-info animate-pulse">
            Processing...
          </div>
        )}
      </div>

      {/* Command Input Area */}
      <div className="p-4 border-t border-gray-700 bg-windows-terminal-bg">
        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mb-2 p-2 bg-gray-800 border border-gray-600 rounded max-h-32 overflow-y-auto">
            <div className="text-xs text-gray-400 mb-1">Suggestions:</div>
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <div
                key={index}
                className={`text-sm px-2 py-1 cursor-pointer rounded ${
                  index === suggestionIndex.current ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => {
                  setCurrentInput(suggestion);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {/* Input Line */}
        <div className="flex items-center space-x-2">
          <span className="text-windows-terminal-prompt font-bold flex-shrink-0">
            {getCurrentPrompt()}
          </span>
          <Input
            ref={inputRef}
            value={currentInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-windows-terminal-text windows-console focus:ring-0 focus:outline-none p-0"
            placeholder="Type a command or try natural language..."
            disabled={isProcessing}
            spellCheck={false}
          />
          
          {/* History Navigation Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-500 hover:text-white"
              onClick={() => {
                if (commandHistory.length > 0) {
                  const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                  setHistoryIndex(newIndex);
                  setCurrentInput(commandHistory[newIndex]);
                  inputRef.current?.focus();
                }
              }}
              disabled={commandHistory.length === 0}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-500 hover:text-white"
              onClick={() => {
                if (historyIndex !== -1) {
                  const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : -1;
                  setHistoryIndex(newIndex);
                  setCurrentInput(newIndex === -1 ? '' : commandHistory[newIndex]);
                  inputRef.current?.focus();
                }
              }}
              disabled={historyIndex === -1}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Command History Counter */}
        {commandHistory.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            History: {commandHistory.length} commands
            {historyIndex !== -1 && ` (showing #${historyIndex + 1})`}
          </div>
        )}
      </div>
    </div>
  );
};