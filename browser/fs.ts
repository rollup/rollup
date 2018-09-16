const nope = (method: string) => (..._args: any[]): any => {
	throw new Error(`Cannot use fs.${method} inside browser`);
};

export const lstatSync = nope('lstatSync');
export const readdirSync = nope('readdirSync');
export const readFileSync = nope('readFileSync');
export const realpathSync = nope('realpathSync');
export const writeFile = nope('writeFile');
