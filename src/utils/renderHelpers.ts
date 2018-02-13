import { Node } from '../ast/nodes/shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../Module';

const NON_WHITESPACE = /\S/;

// It is the responsibility of the caller to make sure this is not searching a potentially very long comment-less
// string for a comment; experiments show, however, that this is only relevant for about 1000+ characters
export function findFirstOccurrenceOutsideComment (code: string, searchString: string, start: number = 0) {
	let commentStart, searchPos;
	while (true) {
		commentStart = code.indexOf('/', start);
		searchPos = code.indexOf(searchString, start);
		if (commentStart === -1) break;
		if (searchPos >= commentStart) {
			searchPos = -1;
		} else if (searchPos !== -1) break;
		start = commentStart + 1;
		if (code[start] === '*') {
			start = code.indexOf('*/', start) + 2;
		} else if (code[start] === '/') {
			start = code.indexOf('\n', start) + 1;
		}
	}
	return searchPos;
}

function findFirstLineBreakOutsideComment (code: string, start: number = 0) {
	let commentStart, lineBreakPos;
	while (true) {
		commentStart = code.indexOf('/*', start);
		lineBreakPos = code.indexOf('\n', start);
		if (commentStart === -1) break;
		if (lineBreakPos >= commentStart) {
			lineBreakPos = -1;
		} else if (lineBreakPos !== -1) break;
		start = code.indexOf('*/', commentStart) + 2;
	}
	return lineBreakPos;
}

export function renderStatementList (statements: Node[], code: MagicString, start: number, end: number, options: RenderOptions) {
	if (statements.length === 0) return;
	let currentNode, currentNodeStart, currentNodeNeedsBoundaries, nextNodeStart;
	let nextNode = statements[0];
	let nextNodeNeedsBoundaries = !nextNode.included || nextNode.needsBoundaries;
	if (nextNodeNeedsBoundaries) {
		nextNodeStart = start + findFirstLineBreakOutsideComment(code.original.slice(start, nextNode.start)) + 1;
	}

	for (let nextIndex = 1; nextIndex <= statements.length; nextIndex++) {
		currentNode = nextNode;
		currentNodeStart = nextNodeStart;
		currentNodeNeedsBoundaries = nextNodeNeedsBoundaries;
		nextNode = statements[nextIndex];
		nextNodeNeedsBoundaries = nextNode === undefined ? false : !nextNode.included || nextNode.needsBoundaries;
		if (currentNodeNeedsBoundaries || nextNodeNeedsBoundaries) {
			nextNodeStart = currentNode.end + findFirstLineBreakOutsideComment(
				code.original.slice(currentNode.end, nextNode === undefined ? end : nextNode.start)
			) + 1;
			if (currentNode.included) {
				currentNodeNeedsBoundaries
					? currentNode.render(code, options, { start: currentNodeStart, end: nextNodeStart })
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
export function getCommaSeparatedNodesWithSeparators<N extends Node> (
	nodes: N[],
	code: MagicString,
	start: number,
	end: number
): ({
	node: N;
	start: number;
	separator: number | null;
	end: number;
})[] {
	const splitUpNodes = [];
	let currentNode, currentNodeStart, separator;
	let nextNode = nodes[0];
	let nextNodeStart = start + findFirstLineBreakOutsideComment(code.original.slice(start, nextNode.start)) + 1;
	nextNodeStart += code.original.slice(nextNodeStart, nextNode.start + 1).search(NON_WHITESPACE);

	for (let nextIndex = 1; nextIndex <= nodes.length; nextIndex++) {
		currentNode = nextNode;
		currentNodeStart = nextNodeStart;
		nextNode = nodes[nextIndex];

		if (nextNode === undefined) {
			splitUpNodes.push({
				node: currentNode, start: currentNodeStart, end, separator: null
			});
		} else {
			separator = currentNode.end + findFirstOccurrenceOutsideComment(
				code.original.slice(currentNode.end, nextNode.start), ','
			);
			nextNodeStart = separator + 1 + findFirstLineBreakOutsideComment(
				code.original.slice(separator + 1, nextNode.start)
			) + 1;
			nextNodeStart += code.original.slice(nextNodeStart, nextNode.start + 1).search(NON_WHITESPACE);
			splitUpNodes.push({
				node: currentNode, start: currentNodeStart, end: nextNodeStart, separator
			});
		}
	}
	return splitUpNodes;
}
