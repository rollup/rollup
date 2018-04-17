import { Node } from '../ast/nodes/shared/Node';
import MagicString from 'magic-string';
import { DynamicImportMechanism } from '../Chunk';

export interface RenderOptions {
	legacy: boolean;
	freeze: boolean;
	namespaceToStringTag: boolean;
	indent: string;
	importMechanism?: DynamicImportMechanism;
	systemBindings: boolean;
}

export interface NodeRenderOptions {
	start?: number;
	end?: number;
	isNoStatement?: boolean;
	renderedParentType?: string; // also serves as a flag if the rendered parent is different from the actual parent
	isCalleeOfRenderedParent?: boolean;
}

export const NO_SEMICOLON: NodeRenderOptions = { isNoStatement: true };

export function findFirstOccurrenceOutsideComment(
	code: string,
	searchString: string,
	start: number = 0
) {
	let commentStart, searchPos;
	while (true) {
		commentStart = code.indexOf('/', start);
		searchPos = code.indexOf(searchString, start);
		if (commentStart === -1) break;
		if (searchPos >= commentStart) {
			searchPos = -1;
		} else if (searchPos !== -1) break;
		start = commentStart + 1;
		if (code.charCodeAt(start) === 42 /*"*"*/) {
			start = code.indexOf('*/', start) + 2;
		} else if (code.charCodeAt(start) === 47 /*"/"*/) {
			start = code.indexOf('\n', start) + 1;
		}
	}
	return searchPos;
}

function findFirstLineBreakOutsideComment(code: string, start: number = 0) {
	let commentStart, lineBreakPos, nextChar;
	while (true) {
		lineBreakPos = code.indexOf('\n', start);
		do {
			commentStart = code.indexOf('/', start);
			if (commentStart === -1 || commentStart > lineBreakPos) return lineBreakPos;
			nextChar = code[commentStart + 1];
			if (nextChar === '/') return lineBreakPos;
			if (nextChar === '*') break;
			start = commentStart + 2;
		} while (true);
		start = code.indexOf('*/', commentStart) + 2;
		if (start === -1) return -1;
	}
}

export function renderStatementList(
	statements: Node[],
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
							start: currentNodeStart,
							end: nextNodeStart
					  })
					: currentNode.render(code, options);
			} else {
				code.remove(currentNodeStart, nextNodeStart);
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
	node: N;
	start: number;
	separator: number | null;
	contentEnd: number;
	end: number;
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
				node,
				start,
				contentEnd,
				separator,
				end: nextNodeStart
			});
		}
		node = nextNode;
		start = nextNodeStart;
	}
	splitUpNodes.push({
		node,
		start,
		separator: null,
		contentEnd: end,
		end
	});
	return splitUpNodes;
}
