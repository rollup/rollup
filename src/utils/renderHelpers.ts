import { Node } from '../ast/nodes/shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../Module';

export function findFirstOccurrenceOutsideComment (code: string, searchString: string) {
	let codeStart = 0;
	let commentStart, commentLength, searchPos;
	while (true) {
		commentStart = code.indexOf('/');
		searchPos = (commentStart === -1 ? code : code.slice(0, commentStart)).indexOf(searchString);
		if (searchPos !== -1 || commentStart === -1) {
			break;
		}
		code = code.slice(commentStart + 1);
		codeStart += commentStart + 1;
		if (code[0] === '*') {
			commentLength = code.indexOf('*/') + 2;
		} else if (code[0] === '/') {
			commentLength = code.indexOf('\n') + 1;
		} else {
			continue;
		}
		code = code.slice(commentLength);
		codeStart += commentLength;
	}
	return searchPos === -1 ? -1 : codeStart + searchPos;
}

export function findFirstLineBreakOutsideComment (code: string) {
	let codeStart = 0;
	let commentStart, commentLength, lineBreakPos;
	while (true) {
		commentStart = code.indexOf('/*');
		lineBreakPos = (commentStart !== -1 ? code.slice(0, commentStart) : code).indexOf('\n');
		if (lineBreakPos !== -1 || commentStart === -1) {
			break;
		}
		code = code.slice(commentStart);
		commentLength = code.indexOf('*/') + 2;
		code = code.slice(commentLength);
		codeStart += commentStart + commentLength;
	}
	return lineBreakPos === -1 ? -1 : codeStart + lineBreakPos;
}

export function renderStatementList (statements: Node[], code: MagicString, start: number, end: number, options: RenderOptions) {
	if (statements.length === 0) return;
	let currentNode, currentNodeStart;
	let nextNode = statements[0];
	let nextNodeStart = start + findFirstLineBreakOutsideComment(code.original.slice(start, nextNode.start)) + 1;

	for (let nextIndex = 1; nextIndex <= statements.length; nextIndex++) {
		currentNode = nextNode;
		currentNodeStart = nextNodeStart;
		nextNode = statements[nextIndex];
		nextNodeStart = currentNode.end + findFirstLineBreakOutsideComment(
			code.original.slice(currentNode.end, nextNode === undefined ? end : nextNode.start)
		) + 1;
		if (currentNode.included) {
			currentNode.render(code, options, { start: currentNodeStart, end: nextNodeStart });
		} else {
			code.remove(currentNodeStart, nextNodeStart);
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
	nextNodeStart += code.original.slice(nextNodeStart, nextNode.start + 1).search(/\S/);

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
			nextNodeStart += code.original.slice(nextNodeStart, nextNode.start + 1).search(/\S/);
			splitUpNodes.push({
				node: currentNode, start: currentNodeStart, end: nextNodeStart, separator
			});
		}
	}
	return splitUpNodes;
}
