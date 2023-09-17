import type MagicString from 'magic-string';
import { BLANK, EMPTY_ARRAY } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	type NodeRenderOptions,
	removeLineBreaks,
	type RenderOptions
} from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import {
	EMPTY_PATH,
	type ObjectPath,
	type PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UnknownValue
} from './shared/Expression';
import { MultiExpression } from './shared/MultiExpression';
import { type ExpressionNode, type IncludeChildren, NodeBase } from './shared/Node';

export type LogicalOperator = '||' | '&&' | '??';

export default class LogicalExpression extends NodeBase implements DeoptimizableEntity {
	declare left: ExpressionNode;
	declare operator: LogicalOperator;
	declare right: ExpressionNode;
	declare type: NodeType.tLogicalExpression;

	// We collect deoptimization information if usedBranch !== null
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private isBranchResolutionAnalysed = false;
	private usedBranch: ExpressionNode | null = null;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		this.left.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
		this.right.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
	}

	deoptimizeCache(): void {
		if (this.usedBranch) {
			const unusedBranch = this.usedBranch === this.left ? this.right : this.left;
			this.usedBranch = null;
			unusedBranch.deoptimizePath(UNKNOWN_PATH);
			const { context, expressionsToBeDeoptimized } = this;
			this.expressionsToBeDeoptimized = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
			// Request another pass because we need to ensure "include" runs again if
			// it is rendered
			context.requestTreeshakingPass();
		}
	}

	deoptimizePath(path: ObjectPath): void {
		const usedBranch = this.getUsedBranch();
		if (usedBranch) {
			usedBranch.deoptimizePath(path);
		} else {
			this.left.deoptimizePath(path);
			this.right.deoptimizePath(path);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		const usedBranch = this.getUsedBranch();
		if (!usedBranch) return UnknownValue;
		this.expressionsToBeDeoptimized.push(origin);
		return usedBranch.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		const usedBranch = this.getUsedBranch();
		if (!usedBranch)
			return [
				new MultiExpression([
					this.left.getReturnExpressionWhenCalledAtPath(
						path,
						interaction,
						recursionTracker,
						origin
					)[0],
					this.right.getReturnExpressionWhenCalledAtPath(
						path,
						interaction,
						recursionTracker,
						origin
					)[0]
				]),
				false
			];
		this.expressionsToBeDeoptimized.push(origin);
		return usedBranch.getReturnExpressionWhenCalledAtPath(
			path,
			interaction,
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.left.hasEffects(context)) {
			return true;
		}
		if (this.getUsedBranch() !== this.left) {
			return this.right.hasEffects(context);
		}
		return false;
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const usedBranch = this.getUsedBranch();
		if (!usedBranch) {
			return (
				this.left.hasEffectsOnInteractionAtPath(path, interaction, context) ||
				this.right.hasEffectsOnInteractionAtPath(path, interaction, context)
			);
		}
		return usedBranch.hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		const usedBranch = this.getUsedBranch();
		if (
			includeChildrenRecursively ||
			(usedBranch === this.right && this.left.shouldBeIncluded(context)) ||
			!usedBranch
		) {
			this.left.include(context, includeChildrenRecursively);
			this.right.include(context, includeChildrenRecursively);
		} else {
			usedBranch.include(context, includeChildrenRecursively);
		}
	}

	removeAnnotations(code: MagicString) {
		this.left.removeAnnotations(code);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{
			isCalleeOfRenderedParent,
			preventASI,
			renderedParentType,
			renderedSurroundingElement
		}: NodeRenderOptions = BLANK
	): void {
		if (!this.left.included || !this.right.included) {
			const operatorPos = findFirstOccurrenceOutsideComment(
				code.original,
				this.operator,
				this.left.end
			);
			if (this.right.included) {
				const removePos = findNonWhiteSpace(code.original, operatorPos + 2);
				code.remove(this.start, removePos);
				if (preventASI) {
					removeLineBreaks(code, removePos, this.right.start);
				}
				this.left.removeAnnotations(code);
			} else {
				code.remove(operatorPos, this.end);
			}
			this.getUsedBranch()!.render(code, options, {
				isCalleeOfRenderedParent,
				preventASI,
				renderedParentType: renderedParentType || this.parent.type,
				renderedSurroundingElement: renderedSurroundingElement || this.parent.type
			});
		} else {
			this.left.render(code, options, {
				preventASI,
				renderedSurroundingElement
			});
			this.right.render(code, options);
		}
	}

	private getUsedBranch() {
		if (!this.isBranchResolutionAnalysed) {
			this.isBranchResolutionAnalysed = true;
			const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
			if (typeof leftValue === 'symbol') {
				return null;
			} else {
				this.usedBranch =
					(this.operator === '||' && leftValue) ||
					(this.operator === '&&' && !leftValue) ||
					(this.operator === '??' && leftValue != null)
						? this.left
						: this.right;
			}
		}
		return this.usedBranch;
	}
}
