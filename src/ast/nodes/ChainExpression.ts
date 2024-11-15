import type MagicString from 'magic-string';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext } from '../ExecutionContext';
import type { EntityPathTracker, ObjectPath } from '../utils/PathTracker';
import type CallExpression from './CallExpression';
import type MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import type { LiteralValueOrUnknown } from './shared/Expression';
import { IS_SKIPPED_CHAIN, NodeBase } from './shared/Node';

export default class ChainExpression extends NodeBase implements DeoptimizableEntity {
	declare expression: CallExpression | MemberExpression;
	declare type: NodeType.tChainExpression;

	// deoptimizations are not relevant as we are not caching values
	deoptimizeCache(): void {}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		const literalValue = this.expression.getLiteralValueAtPathAsChainElement(
			path,
			recursionTracker,
			origin
		);
		return literalValue === IS_SKIPPED_CHAIN ? undefined : literalValue;
	}

	hasEffects(context: HasEffectsContext): boolean {
		return this.expression.hasEffectsAsChainElement(context) === true;
	}

	removeAnnotations(code: MagicString) {
		this.expression.removeAnnotations(code);
	}

	protected applyDeoptimizations() {}
}
