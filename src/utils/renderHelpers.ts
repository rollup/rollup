import MagicString from 'magic-string';
import { Node, StatementNode } from '../ast/nodes/shared/Node';
import { treeshakeNode } from './treeshakeNode';

export interface RenderOptions {
	compact: boolean;
	dynamicImportFunction: string;
	format: string;
	freeze: boolean;
	indent: string;
	namespaceToStringTag: boolean;
	varOrConst: 'var' | 'const';
}

export interface NodeRenderOptions {
	end?: number;
	isCalleeOfRenderedParent?: boolean;
	isNoStatement?: boolean;
	isShorthandProperty?: boolean;
	renderedParentType?: string; // also serves as a flag if the rendered parent is different from the actual parent
	start?: number;
}

export const NO_SEMICOLON: NodeRenderOptions = { isNoStatement: true };

export function findFirstOccurrenceOutsideComment(code: string, searchString: string, start = 0) {
	let searchPos, charCodeAfterSlash;
	searchPos = code.indexOf(searchString, start);
	while (true) {
		start = code.indexOf('/', start);
		if (start === -1 || start > searchPos) return searchPos;
		charCodeAfterSlash = code.charCodeAt(++start);
		++start;
		if (charCodeAfterSlash === 47 /*"/"*/) {
			start = code.indexOf('\n', start) + 1;
			if (start === 0) return -1;
			if (start > searchPos) {
				searchPos = code.indexOf(searchString, start);
			}
		} else if (charCodeAfterSlash === 42 /*"*"*/) {
			start = code.indexOf('*/', start) + 2;
			if (start > searchPos) {
				searchPos = code.indexOf(searchString, start);
			}
		}
	}
}

export function findFirstLineBreakOutsideComment(code: string, start = 0) {
	let lineBreakPos, charCodeAfterSlash;
	lineBreakPos = code.indexOf('\n', start);
	while (true) {
		start = code.indexOf('/', start);
		if (start === -1 || start > lineBreakPos) return lineBreakPos;
		charCodeAfterSlash = code.charCodeAt(++start);
		if (charCodeAfterSlash === 47 /*"/"*/) return lineBreakPos;
		++start;
		if (charCodeAfterSlash === 42 /*"*"*/) {
			start = code.indexOf('*/', start) + 2;
			if (start > lineBreakPos) {
				lineBreakPos = code.indexOf('\n', start);
			}
		}
	}
}

export function renderStatementList(
	statements: StatementNode[],
	code: MagicString,
	start: number,
	end: number,
	options: RenderOptions
) {
	if (statements.length === 0) return;
	let currentNode, currentNodeStart, currentNodeNeedsBoundaries, nextNodeStart;
	let nextNode = statements[0];
	let nextNodeNeedsBoundaries = !nextNode.included || nextNode.needsBoundaries;
	if (nextNodeNeedsBoundaries) {
		nextNodeStart =
			start + findFirstLineBreakOutsideComment(code.original.slice(start, nextNode.start)) + 1;
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
				) +
				1;
			if (currentNode.included) {
				currentNodeNeedsBoundaries
					? currentNode.render(code, options, {
							end: nextNodeStart,
							start: currentNodeStart
					  })
					: currentNode.render(code, options);
			} else {
				treeshakeNode(currentNode, code, currentNodeStart, nextNodeStart);
			}
		} else {
			currentNode.render(code, options);
		}
	}
}

// This assumes that the first character is not part of the first node
export function getCommaSeparatedNodesWithBoundaries<N extends Node>(
	nodes: N[],
	code: MagicString,
	start: number,
	end: number
): ({
	contentEnd: number;
	end: number;
	node: N;
	separator: number | null;
	start: number;
})[] {
	const splitUpNodes = [];
	let node, nextNode, nextNodeStart, contentEnd, char;
	let separator = start - 1;

	for (let nextIndex = 0; nextIndex < nodes.length; nextIndex++) {
		nextNode = nodes[nextIndex];
		if (node !== undefined) {
			separator =
				node.end +
				findFirstOccurrenceOutsideComment(code.original.slice(node.end, nextNode.start), ',');
		}
		nextNodeStart = contentEnd =
			separator +
			2 +
			findFirstLineBreakOutsideComment(code.original.slice(separator + 1, nextNode.start));
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
		node,
		separator: null,
		start
	});
	return splitUpNodes;
}
