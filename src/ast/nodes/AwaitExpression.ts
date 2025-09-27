import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import { isImportExpressionNode } from '../utils/identifyNode';
import { type ObjectPath } from '../utils/PathTracker';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import type * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import { type ExpressionNode, type IncludeChildren, type Node, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	declare argument: ExpressionNode;
	declare type: NodeType.tAwaitExpression;

	hasEffects(): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return true;
	}

	initialise(): void {
		super.initialise();
		let parent = this.parent;
		do {
			if (parent instanceof FunctionNode || parent instanceof ArrowFunctionExpression) return;
		} while ((parent = (parent as Node).parent as Node));
		this.scope.context.usesTopLevelAwait = true;
	}

	shouldIncludeArgument(context: InclusionContext): boolean {
		return !isImportExpressionNode(this.argument) || this.argument.shouldBeIncluded(context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		if (this.shouldIncludeArgument(context)) {
			this.argument.include(context, includeChildrenRecursively);
		}
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		// Thenables need to be included
		if (this.shouldIncludeArgument(context)) {
			this.argument.includePath(THEN_PATH, context);
		}
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) this.includeNode(context);
		if (this.shouldIncludeArgument(context)) {
			this.argument.includePath(path, context);
		}
	}
	render(code: MagicString, options: RenderOptions): void {
		if (!this.argument.included) {
			code.overwrite(this.argument.start, this.argument.end, '0');
		} else {
			this.argument.render(code, options);
		}
	}
}

const THEN_PATH = ['then'];
