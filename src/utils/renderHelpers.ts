import { Node } from '../ast/nodes/shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../Module';
import { NodeType } from '../ast/nodes/NodeType';

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
	// TODO we need to work around a bug in magic-string when nodeStart = start = 0
	let nextNodeStart = start + (nextNode.start === start ? 0 : findFirstLineBreakOutsideComment(code.slice(start, nextNode.start)));

	for (let nextIndex = 1; nextIndex <= statements.length; nextIndex++) {
		currentNode = nextNode;
		currentNodeStart = nextNodeStart;
		nextNode = statements[nextIndex];
		if (!currentNode.included || (nextNode !== undefined && !nextNode.included)) {
			nextNodeStart = currentNode.end + (findFirstLineBreakOutsideComment(code.slice(
				currentNode.end,
				nextNode !== undefined ? nextNode.start : end
			)));
			if (
				!currentNode.included
				&& currentNode.type !== NodeType.ExportDefaultDeclaration
				&& currentNode.type !== NodeType.IfStatement
			) {
				code.remove(currentNodeStart, nextNodeStart);
			} else {
				currentNode.render(code, options);
			}
		} else {
			currentNode.render(code, options);
		}
	}
}
