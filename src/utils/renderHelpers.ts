import { Node } from '../ast/nodes/shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../Module';

export function findFirstOccurrenceOutsideComment (code: string, searchString: string) {
	let codeStart = 0;
	let commentStart, commentLength, lineBreakPos;
	while (true) {
		commentStart = code.indexOf('/');
		lineBreakPos = (~commentStart ? code.slice(0, commentStart) : code).indexOf(searchString);
		if (~lineBreakPos || !~commentStart) {
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
	return ~lineBreakPos ? codeStart + lineBreakPos : -1;
}

// Note that if the string is not found, "0" is returned instead of e.g. "-1" as this works best
// for the main use case
function findFirstLineBreakOutsideComment (code: string) {
	let codeStart = 0;
	let commentStart, commentLength, lineBreakPos;
	while (true) {
		commentStart = code.indexOf('/*');
		lineBreakPos = (~commentStart ? code.slice(0, commentStart) : code).indexOf('\n');
		if (~lineBreakPos || !~commentStart) {
			break;
		}
		code = code.slice(commentStart);
		commentLength = code.indexOf('*/') + 2;
		code = code.slice(commentLength);
		codeStart += commentStart + commentLength;
	}
	return ~lineBreakPos ? codeStart + lineBreakPos : 0;
}

export function renderStatementBlock (statements: Node[], code: MagicString, start: number, end: number, options: RenderOptions) {
	if (statements.length === 0) return;
	let currentNode, currentNodeStart;
	let nextNode = statements[0];
	let nextNodeStart = start + findFirstLineBreakOutsideComment(code.original.slice(start, nextNode.start));

	for (let nextIndex = 1; nextIndex <= statements.length; nextIndex++) {
		currentNode = nextNode;
		currentNodeStart = nextNodeStart;
		nextNode = statements[nextIndex];
		nextNodeStart = currentNode.end + (findFirstLineBreakOutsideComment(code.original.slice(
			currentNode.end, nextNode !== undefined ? nextNode.start : end
		)));
		if (!currentNode.included) {
			code.remove(currentNodeStart, nextNodeStart);
		} else {
			currentNode.render(code, options, { start: currentNodeStart, end: nextNodeStart });
		}
	}
}
