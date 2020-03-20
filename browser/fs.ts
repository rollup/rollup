const nope = (method: string) => (..._args: any[]): never => {
	throw Object.assign(
		new Error(
			`Cannot access the file system (via "fs.${method}") when using the browser build of Rollup. Make sure you supply a plugin with custom resolveId and load hooks to Rollup.`
		),
		{ code: 'NO_FS_IN_BROWSER', url: 'https://rollupjs.org/guide/en/#a-simple-example' }
	);
};

export const lstatSync = nope('lstatSync');
export const readdirSync = nope('readdirSync');
export const readFile = nope('readFile');
export const realpathSync = nope('realpathSync');
export const writeFile = nope('writeFile');
