import type { ast } from '../../rollup/types';
import type { InclusionContext } from '../ExecutionContext';
import { type ObjectPath } from '../utils/PathTracker';
import type * as nodes from './node-unions';
import type { AwaitExpressionParent } from './node-unions';
import * as NodeType from './NodeType';
import { type IncludeChildren, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase<ast.AwaitExpression> {
	parent!: AwaitExpressionParent;
	argument!: nodes.Expression;
	type!: NodeType.tAwaitExpression;

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return true;
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			this.included = true;
			checkTopLevelAwait: if (!this.scope.context.usesTopLevelAwait) {
				let parent: nodes.AstNode | null = this.parent;
				do {
					const { type } = parent;
					if (
						type === NodeType.ArrowFunctionExpression ||
						type === NodeType.FunctionExpression ||
						type === NodeType.FunctionDeclaration
					) {
						break checkTopLevelAwait;
					}
				} while ((parent = parent.parent));
				this.scope.context.usesTopLevelAwait = true;
			}
		}
		this.argument.includePath(path, context, includeChildrenRecursively);
	}
}
