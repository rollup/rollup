import { error, errorNoFileSystemInBrowser } from '../../src/utils/error';

export const throwNoFileSystem = (method: string) => (): never =>
	error(errorNoFileSystemInBrowser(method));
