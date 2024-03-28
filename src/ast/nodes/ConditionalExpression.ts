import type MagicString from 'magic-string';
import { BLANK, EMPTY_ARRAY } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	removeLineBreaks
} from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import type { ObjectPath, PathTracker } from '../utils/PathTracker';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER, UNKNOWN_PATH } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import type SpreadElement from './SpreadElement';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import type { ExpressionEntity, LiteralValueOrUnknown } from './shared/Expression';
import { UnknownValue } from './shared/Expression';
import { MultiExpression } from './shared/MultiExpression';
import type { ExpressionNode, IncludeChildren } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class ConditionalExpression extends NodeBase implements DeoptimizableEntity {
	declare alternate: ExpressionNode;
	declare consequent: ExpressionNode;
	declare test: ExpressionNode;
	declare type: NodeType.tConditionalExpression;

	get isBranchResolutionAnalysed(): boolean {
		return isFlagSet(this.flags, Flag.isBranchResolutionAnalysed);
	}
	set isBranchResolutionAnalysed(value: boolean) {
		this.flags = setFlag(this.flags, Flag.isBranchResolutionAnalysed, value);
	}

	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private usedBranch: ExpressionNode | null = null;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		this.consequent.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
		this.alternate.deoptimizeArgumentsOnInteractionAtPath(interaction, path, recursionTracker);
	}

	deoptimizeCache(): void {
		if (this.usedBranch !== null) {
			const unusedBranch = this.usedBranch === this.consequent ? this.alternate : this.consequent;
			this.usedBranch = null;
			unusedBranch.deoptimizePath(UNKNOWN_PATH);
			const { expressionsToBeDeoptimized } = this;
			this.expressionsToBeDeoptimized = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	deoptimizePath(path: ObjectPath): void {
		const usedBranch = this.getUsedBranch();
		if (usedBranch) {
			usedBranch.deoptimizePath(path);
		} else {
			this.consequent.deoptimizePath(path);
			this.alternate.deoptimizePath(path);
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
					this.consequent.getReturnExpressionWhenCalledAtPath(
						path,
						interaction,
						recursionTracker,
						origin
					)[0],
					this.alternate.getReturnExpressionWhenCalledAtPath(
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
		if (this.test.hasEffects(context)) return true;
		const usedBranch = this.getUsedBranch();
		if (!usedBranch) {
			return this.consequent.hasEffects(context) || this.alternate.hasEffects(context);
		}
		return usedBranch.hasEffects(context);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const usedBranch = this.getUsedBranch();
		if (!usedBranch) {
			return (
				this.consequent.hasEffectsOnInteractionAtPath(path, interaction, context) ||
				this.alternate.hasEffectsOnInteractionAtPath(path, interaction, context)
			);
		}
		return usedBranch.hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		this.included = true;
		const usedBranch = this.getUsedBranch();
		if (includeChildrenRecursively || this.test.shouldBeIncluded(context) || usedBranch === null) {
			this.test.includePath(path, context, includeChildrenRecursively);
			this.consequent.includePath(path, context, includeChildrenRecursively);
			this.alternate.includePath(path, context, includeChildrenRecursively);
		} else {
			usedBranch.includePath(path, context, includeChildrenRecursively);
		}
	}

	includeCallArguments(
		context: InclusionContext,
		parameters: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		const usedBranch = this.getUsedBranch();
		if (usedBranch) {
			usedBranch.includeCallArguments(context, parameters);
		} else {
			this.consequent.includeCallArguments(context, parameters);
			this.alternate.includeCallArguments(context, parameters);
		}
	}

	removeAnnotations(code: MagicString) {
		this.test.removeAnnotations(code);
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
		const usedBranch = this.getUsedBranch();
		if (this.test.included) {
			this.test.render(code, options, { renderedSurroundingElement });
			this.consequent.render(code, options);
			this.alternate.render(code, options);
		} else {
			const colonPos = findFirstOccurrenceOutsideComment(code.original, ':', this.consequent.end);
			const inclusionStart = findNonWhiteSpace(
				code.original,
				(this.consequent.included
					? findFirstOccurrenceOutsideComment(code.original, '?', this.test.end)
					: colonPos) + 1
			);
			if (preventASI) {
				removeLineBreaks(code, inclusionStart, usedBranch!.start);
			}
			code.remove(this.start, inclusionStart);
			if (this.consequent.included) {
				code.remove(colonPos, this.end);
			}
			this.test.removeAnnotations(code);
			usedBranch!.render(code, options, {
				isCalleeOfRenderedParent,
				preventASI: true,
				renderedParentType: renderedParentType || this.parent.type,
				renderedSurroundingElement: renderedSurroundingElement || this.parent.type
			});
		}
	}

	private getUsedBranch() {
		if (this.isBranchResolutionAnalysed) {
			return this.usedBranch;
		}
		this.isBranchResolutionAnalysed = true;
		const testValue = this.test.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
		return typeof testValue === 'symbol'
			? null
			: (this.usedBranch = testValue ? this.consequent : this.alternate);
	}
}
