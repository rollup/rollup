import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import {
	type ExpressionNode,
	type IncludeChildren,
	StatementBase,
	type StatementNode
} from './shared/Node';
import { hasLoopBodyEffects, includeLoopBody } from './shared/loops';

export default class DoWhileStatement extends StatementBase {
	declare body: StatementNode;
	declare test: ExpressionNode;
	declare type: NodeType.tDoWhileStatement;

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
