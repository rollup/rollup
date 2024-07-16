import type { HasEffectsContext } from '../ExecutionContext';
import { NODE_INTERACTION_UNKNOWN_CALL } from '../NodeInteractions';
import { EMPTY_PATH, PathTracker } from '../utils/PathTracker';
import CallExpression from './CallExpression';
import type * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class Decorator extends NodeBase {
	declare type: NodeType.tDecorator;
	declare expression: ExpressionNode;
	hasEffects(context: HasEffectsContext): boolean {
		if (this.expression instanceof CallExpression) {
			if (this.expression.hasEffects(context)) {
				return true;
			}
			const returnExpression = this.expression.callee.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				NODE_INTERACTION_UNKNOWN_CALL,
				new PathTracker(),
				this.expression
			);
			return returnExpression[0].hasEffectsOnInteractionAtPath(
				EMPTY_PATH,
				NODE_INTERACTION_UNKNOWN_CALL,
				context
			);
		} else {
			return this.expression.hasEffectsOnInteractionAtPath(
				EMPTY_PATH,
				NODE_INTERACTION_UNKNOWN_CALL,
				context
			);
		}
	}
}
