import { errNoFileSystemInBrowser, error } from '../../src/utils/error';

export const throwNoFileSystem = (method: string) => (): never =>
	error(errNoFileSystemInBrowser(method));
