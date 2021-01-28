import { error } from '../src/utils/error';

export const throwNoFileSystem = (method: string) => (..._args: any[]): never => {
	error({
		code: 'NO_FS_IN_BROWSER',
		message: `Cannot access the file system (via "${method}") when using the browser build of Rollup. Make sure you supply a plugin with custom resolveId and load hooks to Rollup.`,
		url: 'https://rollupjs.org/guide/en/#a-simple-example'
	});
};
