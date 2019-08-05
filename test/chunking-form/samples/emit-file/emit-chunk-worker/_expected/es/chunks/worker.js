import { s as shared } from './chunk.js';

postMessage(`from worker: ${shared}`);
