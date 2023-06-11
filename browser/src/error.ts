import { error, logNoFileSystemInBrowser } from '../../src/utils/logs';

export const throwNoFileSystem = (method: string) => (): never =>
	error(logNoFileSystemInBrowser(method));
