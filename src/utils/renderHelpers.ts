import { Node } from '../ast/nodes/shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../Module';
import { NodeType } from '../ast/nodes/NodeType';

export function renderStatementBlock (statements: Node[], code: MagicString, start: number, end: number, options: RenderOptions) {
	if (statements.length === 0) return;
	let nodeStart = statements[0].start;
	// To work around a bug in magic-string when nodeStart = start = 0;
	let nextLineBreakPos = nodeStart > start ? code.slice(start, statements[0].start).indexOf('\n') : -1;
	nodeStart = Math.max(0, nextLineBreakPos + 1) + start;

	let nodeEnd;
	for (let nodeIdx = 0; nodeIdx < statements.length; nodeIdx++) {
		const node = statements[nodeIdx];
		if (nodeIdx === statements.length - 1) {
			nodeEnd = end;
		} else {
			const nextNode = statements[nodeIdx + 1];
			nextLineBreakPos = code.slice(node.end, nextNode.start).indexOf('\n');
			nodeEnd = Math.max(0, nextLineBreakPos + 1) + node.end;
		}
		if (!node.included && node.type !== NodeType.ExportDefaultDeclaration && node.type !== NodeType.IfStatement) {
			code.remove(nodeStart, nodeEnd);
		} else {
			node.render(code, options);
		}
		nodeStart = nodeEnd;
	}
}
