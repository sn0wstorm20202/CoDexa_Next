import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

class ProcessManager {
  constructor() {
    this.processes = new Map();
    this.logs = {
      frontend: [],
      backend: [],
      database: []
    };
    this.maxLogLines = 1000;
  }

  addLog(type, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    if (!this.logs[type]) {
      this.logs[type] = [];
    }
    
    this.logs[type].push(logEntry);
    
    // Keep only last N log lines
    if (this.logs[type].length > this.maxLogLines) {
      this.logs[type].shift();
    }
    
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  startProcess(name, command, args, cwd, env = {}) {
    return new Promise((resolve, reject) => {
      console.log(`Starting ${name}...`);
      
      const proc = spawn(command, args, {
        cwd,
        env: { ...process.env, ...env },
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.processes.set(name, proc);

      proc.stdout.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          this.addLog(name, message);
        }
      });

      proc.stderr.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          this.addLog(name, `[ERROR] ${message}`);
        }
      });

      proc.on('error', (error) => {
        this.addLog(name, `[FATAL] ${error.message}`);
        reject(error);
      });

      proc.on('exit', (code) => {
        this.addLog(name, `Process exited with code ${code}`);
        this.processes.delete(name);
        
        // Auto-restart if crashed unexpectedly
        if (code !== 0 && code !== null) {
          this.addLog(name, 'Attempting to restart in 5 seconds...');
          setTimeout(() => {
            this.startProcess(name, command, args, cwd, env);
          }, 5000);
        }
      });

      // Give process time to start
      setTimeout(() => {
        if (this.processes.has(name)) {
          resolve(proc);
        } else {
          reject(new Error(`${name} failed to start`));
        }
      }, 2000);
    });
  }

  async checkHealth(url, maxRetries = 10) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return true;
        }
      } catch (error) {
        await sleep(1000);
      }
    }
    return false;
  }

  async startBackend() {
    try {
      await this.startProcess(
        'backend',
        'npm',
        ['run', 'dev'],
        '/home/user/backend',
        {
          PORT: '8000',
          NODE_ENV: 'development',
          FRONTEND_URL: 'http://localhost:3000'
        }
      );

      this.addLog('backend', 'Backend process started, checking health...');
      
      const healthy = await this.checkHealth('http://localhost:8000/health');
      if (healthy) {
        this.addLog('backend', '✅ Backend is healthy and running on port 8000');
        return true;
      } else {
        this.addLog('backend', '⚠️ Backend started but health check failed');
        return false;
      }
    } catch (error) {
      this.addLog('backend', `❌ Failed to start backend: ${error.message}`);
      throw error;
    }
  }

  async startFrontend() {
    try {
      await this.startProcess(
        'frontend',
        'npm',
        ['run', 'dev'],
        '/home/user/frontend',
        {
          VITE_API_URL: 'http://localhost:8000'
        }
      );

      this.addLog('frontend', 'Frontend process started, waiting for Vite...');
      
      // Wait for Vite to be ready
      await sleep(3000);
      
      const healthy = await this.checkHealth('http://localhost:3000');
      if (healthy) {
        this.addLog('frontend', '✅ Frontend is running on port 3000');
        return true;
      } else {
        this.addLog('frontend', '⚠️ Frontend started but may not be ready yet');
        return false;
      }
    } catch (error) {
      this.addLog('frontend', `❌ Failed to start frontend: ${error.message}`);
      throw error;
    }
  }

  async startAll() {
    console.log('🚀 Starting all processes...\n');

    try {
      // Start backend first
      await this.startBackend();
      await sleep(2000);

      // Then start frontend
      await this.startFrontend();

      console.log('\n✅ All processes started successfully!');
      console.log('🔗 Frontend: http://localhost:3000');
      console.log('🔗 Backend API: http://localhost:8000');
      console.log('📊 Health Check: http://localhost:8000/health\n');

      return true;
    } catch (error) {
      console.error('❌ Failed to start processes:', error);
      this.stopAll();
      return false;
    }
  }

  stopAll() {
    console.log('\n🛑 Stopping all processes...');
    
    this.processes.forEach((proc, name) => {
      this.addLog(name, 'Stopping process...');
      proc.kill('SIGTERM');
    });

    this.processes.clear();
    console.log('✅ All processes stopped');
  }

  getLogs(type) {
    return this.logs[type] || [];
  }

  getAllLogs() {
    return this.logs;
  }

  getStatus() {
    return {
      processes: Array.from(this.processes.keys()),
      healthy: this.processes.size > 0
    };
  }
}

// Handle shutdown gracefully
const manager = new ProcessManager();

process.on('SIGINT', () => {
  console.log('\n\nReceived SIGINT, shutting down...');
  manager.stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nReceived SIGTERM, shutting down...');
  manager.stopAll();
  process.exit(0);
});

// Start all processes
manager.startAll().catch((error) => {
  console.error('Failed to start:', error);
  process.exit(1);
});

export default ProcessManager;
