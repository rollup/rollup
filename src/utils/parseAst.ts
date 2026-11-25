import { parse, parseAsync } from '../../native';
import type {
	CodeEditorParseResult,
	DeserializeAst,
	DeserializeLazyAst,
	ParseAst,
	ParseAstAsync,
	ParseLazyAst,
	ParseLazyAstAsync,
	ParseOptions
} from '../rollup/types';
import { BUFFER_INVENTORY_WORD_COUNT, getAstPosition } from './bufferInventory';
import { deserializeAstBuffer } from './bufferToAst';
import { deserializeLazyAstBuffer } from './bufferToLazyAst';
import { createCodeEditor } from './codeEditor';
import type { AstBuffer } from './getAstBuffer';
import { getAstBuffer } from './getAstBuffer';

export { serializeAst } from './astToBuffer';
export { parseAndWalk } from './parseAndWalk';

function getDeserializationPosition(astBuffer: AstBuffer, position: number | undefined): number {
	if (position === undefined) {
		return getAstPosition(astBuffer);
	}
	if (position < BUFFER_INVENTORY_WORD_COUNT) {
		throw new Error(
			`The "position" argument ${position} points into the buffer inventory. Omit it to deserialize the root node.`
		);
	}
	return position;
}

export const deserializeAst: DeserializeAst = (buffer, position) => {
	const astBuffer = getAstBuffer(buffer);
	return deserializeAstBuffer(astBuffer, getDeserializationPosition(astBuffer, position));
};

export const deserializeLazyAst: DeserializeLazyAst = (buffer, position) => {
	const astBuffer = getAstBuffer(buffer);
	return deserializeLazyAstBuffer(astBuffer, getDeserializationPosition(astBuffer, position));
};

function createParseResult<Ast>(
	input: string,
	astBuffer: AstBuffer,
	node: Ast,
	withCodeEditor: boolean
): Ast | CodeEditorParseResult<Ast> {
	return withCodeEditor ? { ast: node, codeEditor: createCodeEditor(input, astBuffer) } : node;
}

export const parseAst = ((input: string, options: ParseOptions = {}) => {
	const { allowReturnOutsideFunction = false, codeEditor = false, jsx = false } = options;
	const astBuffer = getAstBuffer(parse(input, allowReturnOutsideFunction, jsx, codeEditor));
	return createParseResult(
		input,
		astBuffer,
		deserializeAstBuffer(astBuffer, getAstPosition(astBuffer)),
		codeEditor
	);
}) as ParseAst;

export const parseAstAsync = (async (input: string, options: ParseOptions = {}) => {
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

export const parseLazyAst = ((input: string, options: ParseOptions = {}) => {
	const { allowReturnOutsideFunction = false, codeEditor = false, jsx = false } = options;
	const astBuffer = getAstBuffer(parse(input, allowReturnOutsideFunction, jsx, codeEditor));
	return createParseResult(
		input,
		astBuffer,
		deserializeLazyAstBuffer(astBuffer, getAstPosition(astBuffer)),
		codeEditor
	);
}) as ParseLazyAst;

export const parseLazyAstAsync = (async (input: string, options: ParseOptions = {}) => {
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
