// hash-password.ts
import * as bcrypt from 'bcrypt';

async function main() {
  const password = 'SskyLo45';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hash);
}

main();