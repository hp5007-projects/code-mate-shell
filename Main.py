from flask import Flask, request, jsonify
import os
import subprocess
import shutil
import psutil
import re

app = Flask(__name__)
command_history = []

# --------------------
# File & Directory Commands
# --------------------
def cmd_ls(path="."):
    try:
        return "\n".join(os.listdir(path))
    except FileNotFoundError:
        return "Directory not found"

def cmd_cd(path):
    try:
        os.chdir(path)
        return ""
    except FileNotFoundError:
        return "Directory not found"

def cmd_pwd():
    return os.getcwd()

def cmd_mkdir(dirname):
    try:
        os.makedirs(dirname, exist_ok=True)
        return f"Directory '{dirname}' created"
    except Exception as e:
        return str(e)

def cmd_rm(target):
    if target in ("/", ""):
        return "Error: Cannot remove root directory"
    try:
        if os.path.isdir(target):
            shutil.rmtree(target)
            return f"Directory '{target}' removed"
        elif os.path.isfile(target):
            os.remove(target)
            return f"File '{target}' removed"
        else:
            return "File or directory not found"
    except Exception as e:
        return str(e)

# --------------------
# System Monitoring
# --------------------
def cmd_ps():
    processes = []
    for p in psutil.process_iter(['pid', 'name']):
        processes.append(f"{p.info['pid']:>5}  {p.info['name']}")
    return "\n".join(processes)

def cmd_cpu():
    return f"CPU Usage: {psutil.cpu_percent()}%"

def cmd_mem():
    mem = psutil.virtual_memory()
    return f"Memory Usage: {mem.percent}% ({mem.used // (1024**2)}MB/{mem.total // (1024**2)}MB)"

# --------------------
# AI/NLP Command Parser
# --------------------
def parse_ai_command(text):
    text = text.lower()
    if "create folder" in text or "make folder" in text:
        match = re.search(r"(folder|directory) (\w+)", text)
        if match:
            return f"mkdir {match.group(2)}"
    elif "remove file" in text or "delete file" in text:
        match = re.search(r"(file|directory) (\w+)", text)
        if match:
            return f"rm {match.group(2)}"
    elif "current directory" in text or "where am i" in text:
        return "pwd"
    elif "list files" in text or "show files" in text:
        return "ls"
    return text

# --------------------
# Flask Routes
# --------------------
@app.route("/execute", methods=["POST"])
def execute():
    cmd_input = request.json.get("command", "")
    command_history.append(cmd_input)

    # Parse AI/NLP input
    cmd_input = parse_ai_command(cmd_input)

    # Built-in commands
    if cmd_input.startswith("ls"):
        output = cmd_ls()
    elif cmd_input.startswith("cd "):
        output = cmd_cd(cmd_input[3:].strip())
    elif cmd_input == "pwd":
        output = cmd_pwd()
    elif cmd_input.startswith("mkdir "):
        output = cmd_mkdir(cmd_input[6:].strip())
    elif cmd_input.startswith("rm "):
        output = cmd_rm(cmd_input[3:].strip())
    elif cmd_input == "ps":
        output = cmd_ps()
    elif cmd_input == "cpu":
        output = cmd_cpu()
    elif cmd_input == "mem":
        output = cmd_mem()
    elif cmd_input == "history":
        output = "\n".join(command_history)
    else:
        try:
            output = subprocess.getoutput(cmd_input)
        except Exception as e:
            output = str(e)

    return jsonify({"output": output})

@app.route("/")
def home():
    return "Python backend is running. Connect your frontend terminal here."

if __name__ == "__main__":
    app.run(debug=True)
