import { locate } from 'locate-character';
import { RollupError, RollupWarning } from '../rollup/types';
import getCodeFrame from './getCodeFrame';
import { relative } from './path';

export function error(base: Error | RollupError, props?: RollupError) {
	if (base instanceof Error === false) base = Object.assign(new Error(base.message), base);
	if (props) Object.assign(base, props);
	throw base;
}

export function augmentCodeLocation(
	object: RollupError | RollupWarning,
	pos: { column: number; line: number },
	source: string,
	id: string
): void {
	if (pos.line !== undefined && pos.column !== undefined) {
		const { line, column } = pos;
		object.loc = { file: id, line, column };
	} else {
		object.pos = <any>pos;
		const { line, column } = locate(source, pos, { offsetLine: 1 });
		object.loc = { file: id, line, column };
	}

	if (object.frame === undefined) {
		const { line, column } = object.loc;
		object.frame = getCodeFrame(source, line, column);
	}
}

enum Errors {
	INVALID_CHUNK = 'INVALID_CHUNK'
}

// TODO Lukas polyfill process.cwd()
// TODO Lukas other errors
export function errorCannotAssignModuleToChunk(
	moduleId: string,
	assignToAlias: string,
	currentAlias: string
) {
	error({
		code: Errors.INVALID_CHUNK,
		message: `Cannot assign ${relative(
			process.cwd(),
			moduleId
		)} to the "${assignToAlias}" chunk as it is already in the "${currentAlias}" chunk.`
	});
}
