import { throwNoFileSystem } from './error';

export const readFile = throwNoFileSystem('fs.readFile');
export const writeFile = throwNoFileSystem('fs.writeFile');
