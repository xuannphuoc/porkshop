import { spawn } from 'node:child_process';
const children = [
  spawn(process.execPath, ['server/server.mjs'], { stdio: 'inherit', env: process.env }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit', env: process.env }),
];
function stopChildren() {
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
}
process.on('SIGINT', stopChildren);
process.on('SIGTERM', stopChildren);
for (const child of children) {
  child.on('exit', function (code) {
    if (code !== 0) process.exitCode = 1;
    stopChildren();
  });
}
