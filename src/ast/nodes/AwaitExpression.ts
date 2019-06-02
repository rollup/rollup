import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import { ExpressionNode, IncludeChildren, Node, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	argument!: ExpressionNode;
	type!: NodeType.tAwaitExpression;

	hasEffects(options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}

	include(includeChildrenRecursively: IncludeChildren) {
		if (!this.included && !this.context.usesTopLevelAwait) {
			let parent = this.parent;
			do {
				if (parent instanceof FunctionNode || parent instanceof ArrowFunctionExpression) return;
			} while ((parent = (parent as Node).parent as Node));
			this.context.usesTopLevelAwait = true;
		}
		super.include(includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions) {
		super.render(code, options);
	}
}
