import { throwNoFileSystem } from './error';

export const mkdir = throwNoFileSystem('fs.mkdir');
export const readFile = throwNoFileSystem('fs.readFile');
export const writeFile = throwNoFileSystem('fs.writeFile');
