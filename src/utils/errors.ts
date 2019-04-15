import { error } from './error';
import { relative } from './path';

// TODO Lukas polyfill process.cwd()
// TODO Lukas error constant enum
// TODO Lukas other errors
export function errorCannotAssignModuleToChunk(
	moduleId: string,
	assignToAlias: string,
	currentAlias: string
) {
	error({
		code: 'INVALID_CHUNK',
		message: `Cannot assign ${relative(
			process.cwd(),
			moduleId
		)} to the "${assignToAlias}" chunk as it is already in the "${currentAlias}" chunk.`
	});
}
