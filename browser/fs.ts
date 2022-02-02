import { throwNoFileSystem } from './error';

export const promises = {
	mkdir: throwNoFileSystem('fs.mkdir'),
	readFile: throwNoFileSystem('fs.readFile'),
	writeFile: throwNoFileSystem('fs.writeFile')
};
