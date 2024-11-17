import type { ast } from '../../rollup/types';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { hasLoopBodyEffects, includeLoopBody } from './shared/loops';
import {
	doNotDeoptimize,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';

export default class DoWhileStatement extends NodeBase<ast.DoWhileStatement> {
	parent!: nodes.DoWhileStatementParent;
	body!: nodes.Statement;
	test!: nodes.Expression;
	type!: NodeType.tDoWhileStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) return true;
		return hasLoopBodyEffects(context, this.body);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.test.include(context, includeChildrenRecursively);
		includeLoopBody(context, this.body, includeChildrenRecursively);
	}
}

DoWhileStatement.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
DoWhileStatement.prototype.applyDeoptimizations = doNotDeoptimize;
