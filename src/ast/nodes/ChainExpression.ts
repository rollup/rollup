import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { EntityPathTracker, ObjectPath } from '../utils/PathTracker';
import type CallExpression from './CallExpression';
import type MemberExpression from './MemberExpression';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import type { LiteralValueOrUnknown } from './shared/Expression';
import {
	doNotDeoptimize,
	IS_SKIPPED_CHAIN,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';

export default class ChainExpression
	extends NodeBase<ast.ChainExpression>
	implements DeoptimizableEntity
{
	parent!: nodes.ChainExpressionParent;
	expression!: CallExpression | MemberExpression;
	type!: NodeType.tChainExpression;

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

	includePath(path: ObjectPath, context: InclusionContext) {
		this.included = true;
		this.expression.includePath(path, context);
	}

	removeAnnotations(code: MagicString) {
		this.expression.removeAnnotations(code);
	}
}

ChainExpression.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ChainExpression.prototype.applyDeoptimizations = doNotDeoptimize;
