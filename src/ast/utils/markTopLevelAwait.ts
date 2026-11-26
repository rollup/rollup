import * as NodeType from '../nodes/NodeType';
import type { Node } from '../nodes/shared/Node';

export function markTopLevelAwait(node: Node): void {
	if (node.scope.context.usesTopLevelAwait) return;
	let parent: Node | null = node.parent;
	while (parent) {
		const { type } = parent;
		if (
			type === NodeType.ArrowFunctionExpression ||
			type === NodeType.FunctionExpression ||
			type === NodeType.FunctionDeclaration
		) {
			return;
		}
		parent = parent.parent;
	}
	node.scope.context.usesTopLevelAwait = true;
}
