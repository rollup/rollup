import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type * as NodeType from './NodeType';
import { hasLoopBodyEffects, includeLoopBody } from './shared/loops';
import {
	type ExpressionNode,
	type IncludeChildren,
	onlyIncludeSelf,
	StatementBase,
	type StatementNode
} from './shared/Node';

export default class WhileStatement extends StatementBase {
	declare body: StatementNode;
	declare test: ExpressionNode;
	declare type: NodeType.tWhileStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) return true;
		return hasLoopBodyEffects(context, this.body);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.test.include(context, includeChildrenRecursively);
		includeLoopBody(context, this.body, includeChildrenRecursively);
	}
}

WhileStatement.prototype.includeNode = onlyIncludeSelf;
