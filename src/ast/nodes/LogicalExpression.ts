import type MagicString from 'magic-string';
import { BLANK, EMPTY_ARRAY } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	findLastWhiteSpaceReverse,
	findNonWhiteSpace,
	type NodeRenderOptions,
	removeLineBreaks,
	type RenderOptions
} from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createInclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	type ObjectPath,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import { tryCastLiteralValueToBoolean } from '../utils/tryCastLiteralValueToBoolean';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UnknownFalsyValue,
	UnknownTruthyValue,
	UnknownValue
} from './shared/Expression';
import { MultiExpression } from './shared/MultiExpression';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';

export type LogicalOperator = '||' | '&&' | '??';

export default class LogicalExpression extends NodeBase implements DeoptimizableEntity {
	declare left: ExpressionNode;
	declare operator: LogicalOperator;
	declare right: ExpressionNode;
	declare type: NodeType.tLogicalExpression;

	//private isBranchResolutionAnalysed = false;
	private get isBranchResolutionAnalysed(): boolean {
		return isFlagSet(this.flags, Flag.isBranchResolutionAnalysed);
	}
	private set isBranchResolutionAnalysed(value: boolean) {
		this.flags = setFlag(this.flags, Flag.isBranchResolutionAnalysed, value);
	}

	// We collect deoptimization information if usedBranch !== null
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private usedBranch: ExpressionNode | null = null;

	private get hasDeoptimizedCache(): boolean {
		return isFlagSet(this.flags, Flag.hasDeoptimizedCache);
	}
	private set hasDeoptimizedCache(value: boolean) {
		this.flags = setFlag(this.flags, Flag.hasDeoptimizedCache, value);
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		this.left.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
		this.right.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
	}

	deoptimizeCache(): void {
		if (this.hasDeoptimizedCache) return;
		this.hasDeoptimizedCache = true;
		if (this.usedBranch) {
			const unusedBranch = this.usedBranch === this.left ? this.right : this.left;
			this.usedBranch = null;
			unusedBranch.deoptimizePath(UNKNOWN_PATH);
			if (this.included) {
				// As we are not tracking inclusions, we just include everything
				unusedBranch.includePath(UNKNOWN_PATH, createInclusionContext());
			}
		}
		const {
			scope: { context },
			expressionsToBeDeoptimized
		} = this;
		this.expressionsToBeDeoptimized = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
		for (const expression of expressionsToBeDeoptimized) {
			expression.deoptimizeCache();
		}
		// Request another pass because we need to ensure "include" runs again if
		// it is rendered
		context.requestTreeshakingPass();
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
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (origin === this) return UnknownValue;
		const usedBranch = this.getUsedBranch();
		if (usedBranch) {
			this.expressionsToBeDeoptimized.push(origin);
			return usedBranch.getLiteralValueAtPath(path, recursionTracker, origin);
		} else if (!this.hasDeoptimizedCache && !path.length) {
			const rightValue = this.right.getLiteralValueAtPath(path, recursionTracker, origin);
			const booleanOrUnknown = tryCastLiteralValueToBoolean(rightValue);
			if (typeof booleanOrUnknown !== 'symbol') {
				if (!booleanOrUnknown && this.operator === '&&') {
					this.expressionsToBeDeoptimized.push(origin);
					return UnknownFalsyValue;
				}
				if (booleanOrUnknown && this.operator === '||') {
					this.expressionsToBeDeoptimized.push(origin);
					return UnknownTruthyValue;
				}
			}
		}
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		const usedBranch = this.getUsedBranch();
		if (usedBranch) {
			this.expressionsToBeDeoptimized.push(origin);
			return usedBranch.getReturnExpressionWhenCalledAtPath(
				path,
				interaction,
				recursionTracker,
				origin
			);
		}
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
		if (usedBranch) {
			return usedBranch.hasEffectsOnInteractionAtPath(path, interaction, context);
		}
		return (
			this.left.hasEffectsOnInteractionAtPath(path, interaction, context) ||
			this.right.hasEffectsOnInteractionAtPath(path, interaction, context)
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		const usedBranch = this.getUsedBranch();
		if (
			includeChildrenRecursively ||
			!usedBranch ||
			(usedBranch === this.right && this.left.shouldBeIncluded(context))
		) {
			this.left.include(context, includeChildrenRecursively);
			this.right.include(context, includeChildrenRecursively);
		} else {
			usedBranch.include(context, includeChildrenRecursively);
		}
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		this.included = true;
		const usedBranch = this.getUsedBranch();
		if (!usedBranch || (usedBranch === this.right && this.left.shouldBeIncluded(context))) {
			this.left.includePath(path, context);
			this.right.includePath(path, context);
		} else {
			usedBranch.includePath(path, context);
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
				code.remove(findLastWhiteSpaceReverse(code.original, this.left.end, operatorPos), this.end);
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
			const booleanOrUnknown = tryCastLiteralValueToBoolean(leftValue);
			if (
				typeof booleanOrUnknown === 'symbol' ||
				(this.operator === '??' && typeof leftValue === 'symbol')
			) {
				return null;
			} else {
				this.usedBranch =
					(this.operator === '||' && booleanOrUnknown) ||
					(this.operator === '&&' && !booleanOrUnknown) ||
					(this.operator === '??' && leftValue != null)
						? this.left
						: this.right;
			}
		}
		return this.usedBranch;
	}
}

LogicalExpression.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
LogicalExpression.prototype.applyDeoptimizations = doNotDeoptimize;
