import { a as shared } from './chunk.js';

postMessage(`from worker: ${shared}`);
