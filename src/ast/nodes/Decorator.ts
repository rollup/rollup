import type { HasEffectsContext } from '../ExecutionContext';
import { NODE_INTERACTION_UNKNOWN_CALL } from '../NodeInteractions';
import { EMPTY_PATH } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class Decorator extends NodeBase {
	declare type: NodeType.tDecorator;
	declare expression: ExpressionNode;
	hasEffects(context: HasEffectsContext): boolean {
		return (
			this.expression.hasEffects(context) ||
			this.expression.hasEffectsOnInteractionAtPath(
				EMPTY_PATH,
				NODE_INTERACTION_UNKNOWN_CALL,
				context
			)
		);
	}
}
