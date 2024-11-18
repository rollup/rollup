import type { ast } from '../../rollup/types';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type * as nodes from './node-unions';
import type { DoWhileStatementParent } from './node-unions';
import type * as NodeType from './NodeType';
import { hasLoopBodyEffects, includeLoopBody } from './shared/loops';
import { type IncludeChildren, NodeBase } from './shared/Node';

export default class DoWhileStatement extends NodeBase<ast.DoWhileStatement> {
	parent!: DoWhileStatementParent;
	body!: nodes.Statement;
	test!: nodes.Expression;
	type!: NodeType.tDoWhileStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) return true;
		return hasLoopBodyEffects(context, this.body);
	}

	includePath(
		_path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		this.included = true;
		this.test.includePath(UNKNOWN_PATH, context, includeChildrenRecursively);
		includeLoopBody(context, this.body, includeChildrenRecursively);
	}
}
