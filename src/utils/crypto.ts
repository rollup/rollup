import { createHash as cryptoCreateHash, Hash } from 'crypto';

export const createHash = (): Hash => cryptoCreateHash('sha256');
