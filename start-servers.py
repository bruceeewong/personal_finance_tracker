#!/usr/bin/env python3
import subprocess
import os
import time
import signal
import sys

def kill_processes_on_ports():
    """Kill any processes running on our target ports"""
    for port in [3000, 5001]:
        try:
            subprocess.run(['lsof', '-ti', f':{port}'], 
                         stdout=subprocess.PIPE, 
                         stderr=subprocess.PIPE, 
                         check=True)
            subprocess.run(['kill', '-9'] + 
                         subprocess.run(['lsof', '-ti', f':{port}'], 
                                       capture_output=True, text=True).stdout.strip().split('\n'))
        except subprocess.CalledProcessError:
            pass  # No processes on this port

def start_backend():
    """Start the Flask backend server"""
    os.chdir('backend')
    # Activate virtual environment and start server
    cmd = 'source venv/bin/activate && python -c "import os; os.chdir(\'.\'); exec(open(\'src/main.py\').read().replace(\'port=5000\', \'port=5001\'))"'
    process = subprocess.Popen(cmd, shell=True, executable='/bin/bash')
    os.chdir('..')
    return process

def start_frontend():
    """Start the Vite frontend server"""
    os.chdir('frontend')
    process = subprocess.Popen(['npm', 'run', 'dev'])
    os.chdir('..')
    return process

def main():
    print("Starting Personal Finance Application...")
    
    # Kill existing processes
    kill_processes_on_ports()
    
    # Start backend
    print("Starting backend server on port 5001...")
    backend_process = start_backend()
    time.sleep(3)
    
    # Start frontend
    print("Starting frontend server on port 3000...")
    frontend_process = start_frontend()
    
    print("\nApplication started!")
    print("Frontend: http://localhost:3000")
    print("Backend API: http://localhost:5001")
    print("Network access: http://0.0.0.0:3000")
    print("\nPress Ctrl+C to stop both servers...")
    
    def signal_handler(sig, frame):
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()