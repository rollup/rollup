import { InclusionContext } from '../ExecutionContext';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import { ExpressionNode, IncludeChildren, Node, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	argument!: ExpressionNode;
	type!: NodeType.tAwaitExpression;
	protected deoptimized = false;

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			this.included = true;
			checkTopLevelAwait: if (!this.context.usesTopLevelAwait) {
				let parent = this.parent;
				do {
					if (parent instanceof FunctionNode || parent instanceof ArrowFunctionExpression)
						break checkTopLevelAwait;
				} while ((parent = (parent as Node).parent as Node));
				this.context.usesTopLevelAwait = true;
			}
		}
		this.argument.include(context, includeChildrenRecursively);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		this.argument.deoptimizePath(UNKNOWN_PATH);
	}
}
