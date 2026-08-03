import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const input =
  process.env.OPENAPI_URL?.trim() || 'http://localhost:3000/api/docs-json';
const output = resolve(
  process.cwd(),
  'packages/api-client/src/generated/schema.ts',
);

await mkdir(dirname(output), { recursive: true });

const command =
  process.platform === 'win32'
    ? 'openapi-typescript.cmd'
    : 'openapi-typescript';
const child = spawn(command, [input, '-o', output], {
  cwd: process.cwd(),
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(`No se pudo ejecutar ${command}: ${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`La generacion OpenAPI termino por la señal ${signal}.`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 1;
});
