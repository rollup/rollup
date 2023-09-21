import type MagicString from 'magic-string';
import type { Node, StatementNode } from '../ast/nodes/shared/Node';
import type Variable from '../ast/variables/Variable';
import type { InternalModuleFormat } from '../rollup/types';
import type { PluginDriver } from './PluginDriver';
import type { GenerateCodeSnippets } from './generateCodeSnippets';
import { treeshakeNode } from './treeshakeNode';

export interface RenderOptions {
	accessedDocumentCurrentScript: boolean;
	exportNamesByVariable: Map<Variable, string[]>;
	format: InternalModuleFormat;
	freeze: boolean;
	indent: string;
	pluginDriver: PluginDriver;
	snippets: GenerateCodeSnippets;
	symbols: boolean;
	useOriginalName: ((variable: Variable) => boolean) | null;
}

export interface NodeRenderOptions {
	end?: number;
	isCalleeOfRenderedParent?: boolean;
	isNoStatement?: boolean;
	isShorthandProperty?: boolean;
	preventASI?: boolean;
	/* Indicates if the direct parent of an element changed.
	Necessary for determining the "this" context of callees. */
	renderedParentType?: string;
	/* Indicates if the parent or ancestor surrounding an element has changed and what it changed to.
	Necessary for adding parentheses. */
	renderedSurroundingElement?: string;
	start?: number;
}

export const NO_SEMICOLON: NodeRenderOptions = { isNoStatement: true };

// This assumes there are only white-space and comments between start and the string we are looking for
export function findFirstOccurrenceOutsideComment(
	code: string,
	searchString: string,
	start = 0
): number {
	let searchPos: number, charCodeAfterSlash: number;
	searchPos = code.indexOf(searchString, start);
	while (true) {
		start = code.indexOf('/', start);
		if (start === -1 || start >= searchPos) return searchPos;
		charCodeAfterSlash = code.charCodeAt(++start);
		++start;

		// With our assumption, '/' always starts a comment. Determine comment type:
		start =
			charCodeAfterSlash === 47 /*"/"*/
				? code.indexOf('\n', start) + 1
				: code.indexOf('*/', start) + 2;
		if (start > searchPos) {
			searchPos = code.indexOf(searchString, start);
		}
	}
}

const NON_WHITESPACE = /\S/g;

export function findNonWhiteSpace(code: string, index: number): number {
	NON_WHITESPACE.lastIndex = index;
	const result = NON_WHITESPACE.exec(code)!;
	return result.index;
}

// This assumes "code" only contains white-space and comments
// Returns position of line-comment if applicable
export function findFirstLineBreakOutsideComment(code: string): [number, number] {
	let lineBreakPos,
		charCodeAfterSlash,
		start = 0;
	lineBreakPos = code.indexOf('\n', start);
	while (true) {
		start = code.indexOf('/', start);
		if (start === -1 || start > lineBreakPos) return [lineBreakPos, lineBreakPos + 1];

		// With our assumption, '/' always starts a comment. Determine comment type:
		charCodeAfterSlash = code.charCodeAt(start + 1);
		if (charCodeAfterSlash === 47 /*"/"*/) return [start, lineBreakPos + 1];
		start = code.indexOf('*/', start + 3) + 2;
		if (start > lineBreakPos) {
			lineBreakPos = code.indexOf('\n', start);
		}
	}
}

export function renderStatementList(
	statements: readonly StatementNode[],
	code: MagicString,
	start: number,
	end: number,
	options: RenderOptions
): void {
	let currentNode, currentNodeStart, currentNodeNeedsBoundaries, nextNodeStart;
	let nextNode = statements[0];
	let nextNodeNeedsBoundaries = !nextNode.included || nextNode.needsBoundaries;
	if (nextNodeNeedsBoundaries) {
		nextNodeStart =
			start + findFirstLineBreakOutsideComment(code.original.slice(start, nextNode.start))[1];
	}

	for (let nextIndex = 1; nextIndex <= statements.length; nextIndex++) {
		currentNode = nextNode;
		currentNodeStart = nextNodeStart;
		currentNodeNeedsBoundaries = nextNodeNeedsBoundaries;
		nextNode = statements[nextIndex];
		nextNodeNeedsBoundaries =
			nextNode === undefined ? false : !nextNode.included || nextNode.needsBoundaries;
		if (currentNodeNeedsBoundaries || nextNodeNeedsBoundaries) {
			nextNodeStart =
				currentNode.end +
				findFirstLineBreakOutsideComment(
					code.original.slice(currentNode.end, nextNode === undefined ? end : nextNode.start)
				)[1];
			if (currentNode.included) {
				currentNodeNeedsBoundaries
					? currentNode.render(code, options, {
							end: nextNodeStart,
							start: currentNodeStart
					  })
					: currentNode.render(code, options);
			} else {
				treeshakeNode(currentNode, code, currentNodeStart!, nextNodeStart);
			}
		} else {
			currentNode.render(code, options);
		}
	}
}

// This assumes that the first character is not part of the first node
export function getCommaSeparatedNodesWithBoundaries<N extends Node>(
	nodes: readonly N[],
	code: MagicString,
	start: number,
	end: number
): {
	contentEnd: number;
	end: number;
	node: N;
	separator: number | null;
	start: number;
}[] {
	const splitUpNodes = [];
	let node, nextNodeStart, contentEnd, char;
	let separator = start - 1;

	for (const nextNode of nodes) {
		if (node !== undefined) {
			separator =
				node.end +
				findFirstOccurrenceOutsideComment(code.original.slice(node.end, nextNode.start), ',');
		}
		nextNodeStart = contentEnd =
			separator +
			1 +
			findFirstLineBreakOutsideComment(code.original.slice(separator + 1, nextNode.start))[1];
		while (
			((char = code.original.charCodeAt(nextNodeStart)),
			char === 32 /*" "*/ || char === 9 /*"\t"*/ || char === 10 /*"\n"*/ || char === 13) /*"\r"*/
		)
			nextNodeStart++;
		if (node !== undefined) {
			splitUpNodes.push({
				contentEnd,
				end: nextNodeStart,
				node,
				separator,
				start
			});
		}
		node = nextNode;
		start = nextNodeStart;
	}
	splitUpNodes.push({
		contentEnd: end,
		end,
		node: node as N,
		separator: null,
		start
	});
	return splitUpNodes;
}

// This assumes there are only white-space and comments between start and end
export function removeLineBreaks(code: MagicString, start: number, end: number): void {
	while (true) {
		const [removeStart, removeEnd] = findFirstLineBreakOutsideComment(
			code.original.slice(start, end)
		);
		if (removeStart === -1) {
			break;
		}
		code.remove(start + removeStart, (start += removeEnd));
	}
}
