import { spawn } from 'child_process';

const provider = (process.env.DB_PROVIDER || 'postgres').toLowerCase();
console.log(`Ejecutando seed para proveedor actual: ${provider.toUpperCase()}`);

const script = provider === 'firestore' ? 'scripts/seed-firestore.ts' : 'scripts/seed-postgres.ts';

const child = spawn('npx', ['tsx', script], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
