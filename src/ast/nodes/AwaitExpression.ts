import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import { Node } from './shared/Node';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	type: NodeType.tAwaitExpression;
	argument: ExpressionNode;

	include(includeAllChildrenRecursively: boolean) {
		super.include(includeAllChildrenRecursively);
		if (!this.context.usesTopLevelAwait) {
			let parent = this.parent;
			do {
				if (parent instanceof FunctionNode || parent instanceof ArrowFunctionExpression) return;
			} while ((parent = <Node>(<Node>parent).parent));
			this.context.usesTopLevelAwait = true;
		}
	}

	hasEffects(options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}

	render(code: MagicString, options: RenderOptions) {
		super.render(code, options);
	}
}
