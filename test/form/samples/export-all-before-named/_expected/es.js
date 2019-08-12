export * from 'external';

function internalFn(path) {
	return path[0] === '.';
}

export { internalFn };
