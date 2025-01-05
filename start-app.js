const { spawn } = require('child_process');
const path = require('path');

// Function to start a process
function startProcess(command, args, workDir, name) {
    const process = spawn(command, args, { 
        cwd: workDir,
        shell: true,
        stdio: 'pipe'
    });

    process.stdout.on('data', (data) => {
        console.log(`[${name}] ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[${name}] ${data}`);
    });

    return process;
}

// Start backend server
const backend = startProcess(
    'npm',
    ['start'],
    path.join(__dirname),
    'Backend'
);

// Start frontend server
const frontend = startProcess(
    'npm',
    ['start'],
    path.join(__dirname, 'weight-tracker-frontend'),
    'Frontend'
);

// Handle cleanup when the script is terminated
process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
});