import { createHash as cryptoCreateHash, type Hash } from 'crypto';

export const createHash = (): Hash => cryptoCreateHash('sha256');
