import { a as shared } from './chunks/chunk.js';

postMessage(`from worker: ${shared}`);
