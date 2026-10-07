import FunctionBase from '../nodes/shared/FunctionBase';
import type { Node } from '../nodes/shared/Node';

export function markTopLevelAwait(node: Node): void {
	if (node.scope.context.usesTopLevelAwait) return;
	let parent = node.parent;
	do {
		if (parent instanceof FunctionBase) return;
	} while ((parent = (parent as Node).parent as Node));
	node.scope.context.usesTopLevelAwait = true;
}
