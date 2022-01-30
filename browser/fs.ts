import { throwNoFileSystem } from './error';

export const promises = {
	readFile: throwNoFileSystem('fs.readFile')
};

export const writeFile = throwNoFileSystem('fs.writeFile');
