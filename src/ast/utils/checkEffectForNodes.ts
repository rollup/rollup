import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeBase } from '../nodes/shared/Node';

export function checkEffectForNodes(nodes: Array<NodeBase>, context: HasEffectsContext): boolean {
	for (const node of nodes) {
		if (node.hasEffects(context)) {
			return true;
		}
	}
	return false;
}
