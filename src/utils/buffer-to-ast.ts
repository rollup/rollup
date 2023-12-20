// This file is generated by scripts/generate-ast-converters.js.
// Do not edit this file directly.

import type * as estree from 'estree';
import type { AstNode } from '../rollup/types';
import { FIXED_STRINGS } from './convert-ast-strings';

export const ANNOTATION_KEY = '_rollupAnnotations';
export const INVALID_ANNOTATION_KEY = '_rollupRemoved';

export function convertProgram(buffer: ArrayBuffer, readString: ReadString): ProgramNode {
	return convertNode(0, new Uint32Array(buffer), readString);
}

/* eslint-disable sort-keys */
const nodeConverters: ((position: number, buffer: Uint32Array, readString: ReadString) => any)[] = [
	function arrayExpression(position, buffer, readString): ArrayExpressionNode {
		const start = buffer[position++];
		const end = buffer[position++];
		const elements = convertNodeList(buffer[position++], buffer, readString);
		return {
			type: 'ArrayExpression',
			start,
			end,
			elements
		};
	},
	function arrayPattern(position, buffer, readString): ArrayPatternNode {
		const start = buffer[position++];
		const end = buffer[position++];
		const elements = convertNodeList(buffer[position++], buffer, readString);
		return {
			type: 'ArrayPattern',
			start,
			end,
			elements
		};
	},
	function arrowFunctionExpression(position, buffer, readString): ArrowFunctionExpressionNode {
		const start = buffer[position++];
		const end = buffer[position++];
		const flags = buffer[position++];
		const annotations = convertAnnotations(buffer[position++], buffer);
		const body = convertNode(buffer[position++], buffer, readString);
		const parameters = convertNodeList(buffer[position++], buffer, readString);
		return {
			type: 'ArrowFunctionExpression',
			start,
			end,
			async: (flags & 1) === 1,
			expression: (flags & 2) === 2,
			generator: (flags & 4) === 4,
			...(annotations.length > 0 ? { [ANNOTATION_KEY]: annotations } : {}),
			body,
			params: parameters,
			id: null
		};
	},
	function assignmentExpression(position, buffer, readString): AssignmentExpressionNode {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const operator = FIXED_STRINGS[buffer[position++]] as estree.AssignmentOperator;
		const right = convertNode(buffer[position++], buffer, readString);
		return {
			type: 'AssignmentExpression',
			start,
			end,
			left,
			operator,
			right
		};
	},
	function assignmentPattern(position, buffer, readString): AssignmentPatternNode {
		const start = buffer[position++];
		const end = buffer[position++];
		const left = convertNode(buffer[position++], buffer, readString);
		const right = convertNode(buffer[position++], buffer, readString);
		return {
			type: 'AssignmentPattern',
			start,
			end,
			left,
			right
		};
	},
	function breakStatement(position, buffer, readString): BreakStatementNode {
		const start = buffer[position++];
		const end = buffer[position++];
		const labelPosition = buffer[position++];
		const label = labelPosition === 0 ? null : convertNode(labelPosition, buffer, readString);
		return {
			type: 'BreakStatement',
			start,
			end,
			label
		};
	},
	function program(position, buffer, readString): ProgramNode {
		const start = buffer[position++];
		const end = buffer[position++];
		const annotations = convertAnnotations(buffer[position++], buffer);
		const body = convertNodeList(buffer[position++], buffer, readString);
		return {
			type: 'Program',
			start,
			end,
			...(annotations.length > 0 ? { [INVALID_ANNOTATION_KEY]: annotations } : {}),
			body,
			sourceType: 'module'
		};
	}
];

type ReadString = (start: number, length: number) => string;
export type AnnotationType = 'pure' | 'noSideEffects';

export interface RollupAnnotation {
	start: number;
	end: number;
	type: AnnotationType;
}

type ArrayExpressionNode = estree.ArrayExpression & AstNode;
type ArrayPatternNode = estree.ArrayPattern & AstNode;
type ArrowFunctionExpressionNode = estree.ArrowFunctionExpression &
	AstNode & { [ANNOTATION_KEY]?: RollupAnnotation[] } & { id: null };
type AssignmentExpressionNode = estree.AssignmentExpression & AstNode;
type AssignmentPatternNode = estree.AssignmentPattern & AstNode;
type BreakStatementNode = estree.BreakStatement & AstNode;
type ProgramNode = estree.Program &
	AstNode & { [INVALID_ANNOTATION_KEY]?: RollupAnnotation[] } & { sourceType: 'module' };

function convertNode(position: number, buffer: Uint32Array, readString: ReadString): any {
	const nodeType = buffer[position];
	const converter = nodeConverters[nodeType];
	/* istanbul ignore if: This should never be executed but is a safeguard against faulty buffers */
	if (!converter) {
		console.trace();
		throw new Error(`Unknown node type: ${nodeType}`);
	}
	return converter(position + 1, buffer, readString);
}

function convertNodeList(position: number, buffer: Uint32Array, readString: ReadString): any[] {
	const length = buffer[position++];
	const list: any[] = [];
	for (let index = 0; index < length; index++) {
		const nodePosition = buffer[position++];
		list.push(nodePosition ? convertNode(nodePosition, buffer, readString) : null);
	}
	return list;
}

const convertAnnotations = (position: number, buffer: Uint32Array): RollupAnnotation[] => {
	const length = buffer[position++];
	const list: any[] = [];
	for (let index = 0; index < length; index++) {
		list.push(convertAnnotation(buffer[position++], buffer));
	}
	return list;
};

const convertAnnotation = (position: number, buffer: Uint32Array): RollupAnnotation => {
	const start = buffer[position++];
	const end = buffer[position++];
	const type = FIXED_STRINGS[buffer[position]] as AnnotationType;
	return { end, start, type };
};
