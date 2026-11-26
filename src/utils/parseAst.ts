import { parse, parseAsync } from '../../native';
import type {
	CodeEditorParseResult,
	DeserializeAst,
	DeserializeLazyAst,
	ParseAst,
	ParseAstAsync,
	ParseLazyAst,
	ParseLazyAstAsync,
	ParseOptionsWithCodeEditor
} from '../rollup/types';
import { getAstPosition } from './bufferInventory';
import { deserializeAstBuffer } from './bufferToAst';
import { deserializeLazyAstBuffer } from './bufferToLazyAst';
import { createCodeEditor } from './codeEditor';
import type { AstBuffer } from './getAstBuffer';
import { getAstBuffer } from './getAstBuffer';

export { serializeAst } from './astToBuffer';
export { parseAndWalk } from './parseAndWalk';

export const deserializeAst: DeserializeAst = buffer => {
	const astBuffer = getAstBuffer(buffer);
	return deserializeAstBuffer(astBuffer, getAstPosition(astBuffer));
};

export const deserializeLazyAst: DeserializeLazyAst = buffer => {
	const astBuffer = getAstBuffer(buffer);
	return deserializeLazyAstBuffer(astBuffer, getAstPosition(astBuffer));
};

function createParseResult<Ast>(
	input: string,
	astBuffer: AstBuffer,
	node: Ast,
	withCodeEditor: boolean
): Ast | CodeEditorParseResult<Ast> {
	return withCodeEditor ? { ast: node, codeEditor: createCodeEditor(input, astBuffer) } : node;
}

export const parseAst = ((input: string, options: ParseOptionsWithCodeEditor = {}) => {
	const { allowReturnOutsideFunction = false, codeEditor = false, jsx = false } = options;
	const astBuffer = getAstBuffer(parse(input, allowReturnOutsideFunction, jsx, codeEditor));
	return createParseResult(
		input,
		astBuffer,
		deserializeAstBuffer(astBuffer, getAstPosition(astBuffer)),
		codeEditor
	);
}) as ParseAst;

export const parseAstAsync = (async (input: string, options: ParseOptionsWithCodeEditor = {}) => {
	const { allowReturnOutsideFunction = false, codeEditor = false, jsx = false } = options;
	const astBuffer = getAstBuffer(
		await parseAsync(input, allowReturnOutsideFunction, jsx, codeEditor)
	);
	return createParseResult(
		input,
		astBuffer,
		deserializeAstBuffer(astBuffer, getAstPosition(astBuffer)),
		codeEditor
	);
}) as ParseAstAsync;

export const parseLazyAst = ((input: string, options: ParseOptionsWithCodeEditor = {}) => {
	const { allowReturnOutsideFunction = false, codeEditor = false, jsx = false } = options;
	const astBuffer = getAstBuffer(parse(input, allowReturnOutsideFunction, jsx, codeEditor));
	return createParseResult(
		input,
		astBuffer,
		deserializeLazyAstBuffer(astBuffer, getAstPosition(astBuffer)),
		codeEditor
	);
}) as ParseLazyAst;

export const parseLazyAstAsync = (async (
	input: string,
	options: ParseOptionsWithCodeEditor = {}
) => {
	const { allowReturnOutsideFunction = false, codeEditor = false, jsx = false } = options;
	const astBuffer = getAstBuffer(
		await parseAsync(input, allowReturnOutsideFunction, jsx, codeEditor)
	);
	return createParseResult(
		input,
		astBuffer,
		deserializeLazyAstBuffer(astBuffer, getAstPosition(astBuffer)),
		codeEditor
	);
}) as ParseLazyAstAsync;
