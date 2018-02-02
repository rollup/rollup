import { Node } from '../ast/nodes/shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../Module';
import { NodeType } from '../ast/nodes/NodeType';

// Note that if the string is not found, "0" is returned instead of e.g. "-1"
// as this seems to work best for the main use case
export function findFirstOccurrenceOutsideComment (code: string, searchString: string) {
	let codeStart = 0;
	let commentStart, commentLength, lineBreakPos;
	while (true) {
		commentStart = code.indexOf('/*');
		lineBreakPos = (~commentStart ? code.slice(0, commentStart) : code).indexOf(searchString);
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
	let nextNodeStart = start + findFirstOccurrenceOutsideComment(code.original.slice(start, nextNode.start), '\n');

	for (let nextIndex = 1; nextIndex <= statements.length; nextIndex++) {
		currentNode = nextNode;
		currentNodeStart = nextNodeStart;
		nextNode = statements[nextIndex];
		nextNodeStart = currentNode.end + (findFirstOccurrenceOutsideComment(code.original.slice(
			currentNode.end, nextNode !== undefined ? nextNode.start : end
		), '\n'));
		if (!currentNode.included && currentNode.type !== NodeType.IfStatement) {
			code.remove(currentNodeStart, nextNodeStart);
		} else {
			currentNode.render(code, options, {start: currentNodeStart, end:nextNodeStart});
		}
	}
}
