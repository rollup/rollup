import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	getCommaSeparatedNodesWithBoundaries,
	type NodeRenderOptions,
	removeLineBreaks,
	type RenderOptions
} from '../../utils/renderHelpers';
import { treeshakeNode } from '../../utils/treeshakeNode';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { type EntityPathTracker, type ObjectPath } from '../utils/PathTracker';
import ExpressionStatement from './ExpressionStatement';
import type * as NodeType from './NodeType';
import type { LiteralValueOrUnknown } from './shared/Expression';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';

export default class SequenceExpression extends NodeBase {
	expressions!: ExpressionNode[];
	type!: NodeType.tSequenceExpression;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		this.expressions[this.expressions.length - 1].deoptimizeArgumentsOnInteractionAtPath(
			interaction,
			path,
			recursionTracker
		);
	}

	deoptimizePath(path: ObjectPath): void {
		this.expressions[this.expressions.length - 1].deoptimizePath(path);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
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

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return this.expressions[this.expressions.length - 1].hasEffectsOnInteractionAtPath(
			path,
			interaction,
			context
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		const lastExpression = this.expressions[this.expressions.length - 1];
		for (const expression of this.expressions) {
			if (
				includeChildrenRecursively ||
				(expression === lastExpression && !(this.parent instanceof ExpressionStatement)) ||
				expression.shouldBeIncluded(context)
			) {
				expression.include(context, includeChildrenRecursively);
			}
		}
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		this.included = true;
		this.expressions[this.expressions.length - 1].includePath(path, context);
	}

	removeAnnotations(code: MagicString) {
		this.expressions[0].removeAnnotations(code);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, preventASI }: NodeRenderOptions = BLANK
	): void {
		let includedNodes = 0;
		let lastSeparatorPos: number | null = null;
		const lastNode = this.expressions[this.expressions.length - 1];
		for (const { node, separator, start, end } of getCommaSeparatedNodesWithBoundaries(
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
			lastSeparatorPos = separator;
			if (includedNodes === 1 && preventASI) {
				removeLineBreaks(code, start, node.start);
			}
			if (includedNodes === 1) {
				const parentType = renderedParentType || this.parent.type;
				node.render(code, options, {
					isCalleeOfRenderedParent: isCalleeOfRenderedParent && node === lastNode,
					renderedParentType: parentType,
					renderedSurroundingElement: parentType
				});
			} else {
				node.render(code, options);
			}
		}
		if (lastSeparatorPos) {
			code.remove(lastSeparatorPos, this.end);
		}
	}
}

SequenceExpression.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
SequenceExpression.prototype.applyDeoptimizations = doNotDeoptimize;
