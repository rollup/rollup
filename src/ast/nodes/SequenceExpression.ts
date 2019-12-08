import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	getCommaSeparatedNodesWithBoundaries,
	NodeRenderOptions,
	removeLineBreaks,
	RenderOptions
} from '../../utils/renderHelpers';
import { treeshakeNode } from '../../utils/treeshakeNode';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { ObjectPath, PathTracker } from '../utils/PathTracker';
import { LiteralValueOrUnknown } from '../values';
import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

export default class SequenceExpression extends NodeBase {
	expressions!: ExpressionNode[];
	type!: NodeType.tSequenceExpression;

	deoptimizePath(path: ObjectPath) {
		if (path.length > 0) this.expressions[this.expressions.length - 1].deoptimizePath(path);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.expressions[this.expressions.length - 1].getLiteralValueAtPath(
			path,
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffects(context)) return true;
		}
		return false;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return (
			path.length > 0 &&
			this.expressions[this.expressions.length - 1].hasEffectsWhenAccessedAtPath(path, context)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return (
			path.length === 0 ||
			this.expressions[this.expressions.length - 1].hasEffectsWhenAssignedAtPath(path, context)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		return this.expressions[this.expressions.length - 1].hasEffectsWhenCalledAtPath(
			path,
			callOptions,
			context
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		for (let i = 0; i < this.expressions.length - 1; i++) {
			const node = this.expressions[i];
			if (includeChildrenRecursively || node.shouldBeIncluded(context))
				node.include(context, includeChildrenRecursively);
		}
		this.expressions[this.expressions.length - 1].include(context, includeChildrenRecursively);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, preventASI }: NodeRenderOptions = BLANK
	) {
		let includedNodes = 0;
		for (const { node, start, end } of getCommaSeparatedNodesWithBoundaries(
			this.expressions,
			code,
			this.start,
			this.end
		)) {
			if (!node.included) {
				treeshakeNode(node, code, start, end);
				continue;
			}
			includedNodes++;
			if (includedNodes === 1 && preventASI) {
				removeLineBreaks(code, start, node.start);
			}
			if (node === this.expressions[this.expressions.length - 1] && includedNodes === 1) {
				node.render(code, options, {
					isCalleeOfRenderedParent: renderedParentType
						? isCalleeOfRenderedParent
						: (this.parent as CallExpression).callee === this,
					renderedParentType: renderedParentType || this.parent.type
				});
			} else {
				node.render(code, options);
			}
		}
	}
}
