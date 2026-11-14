import { randomBytes, scryptSync } from 'node:crypto';
import { Writable } from 'node:stream';
import readline from 'node:readline';
let muted = false;
const output = new Writable({
  write(chunk, encoding, done) {
    if (!muted) process.stdout.write(chunk);
    done();
  },
});
const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
rl.question('New administrator password (12+ characters; input hidden): ', (password) => {
  rl.close();
  process.stdout.write('\n');
  if (password.length < 12) {
    process.stderr.write('Use at least 12 characters.\n');
    process.exitCode = 1;
    return;
  }
  const salt = randomBytes(16).toString('hex');
  console.log(`${salt}:${scryptSync(password, salt, 64).toString('hex')}`);
});
muted = true;
