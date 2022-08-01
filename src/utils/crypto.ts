import { createHash as cryptoCreateHash, type Hash } from 'node:crypto';

export const createHash = (): Hash => cryptoCreateHash('sha256');
