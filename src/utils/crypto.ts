import { createHash as cryptoCreateHash } from 'crypto';

export const createHash = () => cryptoCreateHash('sha256');
