import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  process.loadEnvFile(path.resolve(__dirname, '..', '.env'));
} catch (e) {
  console.log('Error loading env:', e);
}

console.log('MINIMAX_API_KEY:', process.env.MINIMAX_API_KEY);
console.log('AGENTIK_VAULT_PATH:', process.env.AGENTIK_VAULT_PATH);
