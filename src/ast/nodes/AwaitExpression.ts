import type { InclusionContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import FunctionNode from './shared/FunctionNode';
import { type ExpressionNode, type IncludeChildren, type Node, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	declare argument: ExpressionNode;
	declare type: NodeType.tAwaitExpression;

	get isTopLevelAwait(): boolean {
		return isFlagSet(this.flags, Flag.isTopLevelAwait);
	}
	set isTopLevelAwait(value: boolean) {
		this.flags = setFlag(this.flags, Flag.isTopLevelAwait, value);
	}

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.argument.include(context, includeChildrenRecursively);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		checkTopLevelAwait: {
			let parent = this.parent;
			do {
				if (parent instanceof FunctionNode || parent instanceof ArrowFunctionExpression)
					break checkTopLevelAwait;
			} while ((parent = (parent as Node).parent as Node));
			this.scope.context.usesTopLevelAwait = true;
			this.isTopLevelAwait = true;
		}
		// Thenables need to be included
		this.argument.includePath(THEN_PATH, context);
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) this.includeNode(context);
		this.argument.includePath(path, context);
	}
}

const THEN_PATH = ['then'];
