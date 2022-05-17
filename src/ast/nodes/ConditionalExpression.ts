import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	NodeRenderOptions,
	removeLineBreaks,
	RenderOptions
} from '../../utils/renderHelpers';
import { removeAnnotations } from '../../utils/treeshakeNode';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { NodeEvent } from '../NodeEvents';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import SpreadElement from './SpreadElement';
import { ExpressionEntity, LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { MultiExpression } from './shared/MultiExpression';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

export default class ConditionalExpression extends NodeBase implements DeoptimizableEntity {
	declare alternate: ExpressionNode;
	declare consequent: ExpressionNode;
	declare test: ExpressionNode;
	declare type: NodeType.tConditionalExpression;

	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private isBranchResolutionAnalysed = false;
	private usedBranch: ExpressionNode | null = null;

	deoptimizeCache(): void {
		if (this.usedBranch !== null) {
			const unusedBranch = this.usedBranch === this.consequent ? this.alternate : this.consequent;
			this.usedBranch = null;
			unusedBranch.deoptimizePath(UNKNOWN_PATH);
			for (const expression of this.expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	deoptimizePath(path: ObjectPath): void {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) {
			this.consequent.deoptimizePath(path);
			this.alternate.deoptimizePath(path);
		} else {
			usedBranch.deoptimizePath(path);
		}
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		this.consequent.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
		this.alternate.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) return UnknownValue;
		this.expressionsToBeDeoptimized.push(origin);
		return usedBranch.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null)
			return new MultiExpression([
				this.consequent.getReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					recursionTracker,
					origin
				),
				this.alternate.getReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					recursionTracker,
					origin
				)
			]);
		this.expressionsToBeDeoptimized.push(origin);
		return usedBranch.getReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext): boolean | undefined {
		if (this.test.hasEffects(context)) return true;
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) {
			return this.consequent.hasEffects(context) || this.alternate.hasEffects(context);
		}
		return usedBranch.hasEffects(context);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean | undefined {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) {
			return (
				this.consequent.hasEffectsWhenAccessedAtPath(path, context) ||
				this.alternate.hasEffectsWhenAccessedAtPath(path, context)
			);
		}
		return usedBranch.hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) {
			return (
				this.consequent.hasEffectsWhenAssignedAtPath(path, context) ||
				this.alternate.hasEffectsWhenAssignedAtPath(path, context)
			);
		}
		return usedBranch.hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) {
			return (
				this.consequent.hasEffectsWhenCalledAtPath(path, callOptions, context) ||
				this.alternate.hasEffectsWhenCalledAtPath(path, callOptions, context)
			);
		}
		return usedBranch.hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		const usedBranch = this.getUsedBranch();
		if (includeChildrenRecursively || this.test.shouldBeIncluded(context) || usedBranch === null) {
			this.test.include(context, includeChildrenRecursively);
			this.consequent.include(context, includeChildrenRecursively);
			this.alternate.include(context, includeChildrenRecursively);
		} else {
			usedBranch.include(context, includeChildrenRecursively);
		}
	}

	includeArgumentsWhenCalledAtPath(
		path: ObjectPath,
		context: InclusionContext,
		args: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) {
			this.consequent.includeArgumentsWhenCalledAtPath(path, context, args);
			this.alternate.includeArgumentsWhenCalledAtPath(path, context, args);
		} else {
			usedBranch.includeArgumentsWhenCalledAtPath(path, context, args);
		}
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
		if (!this.test.included) {
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
			removeAnnotations(this, code);
			usedBranch!.render(code, options, {
				isCalleeOfRenderedParent,
				preventASI: true,
				renderedParentType: renderedParentType || this.parent.type,
				renderedSurroundingElement: renderedSurroundingElement || this.parent.type
			});
		} else {
			this.test.render(code, options, { renderedSurroundingElement });
			this.consequent.render(code, options);
			this.alternate.render(code, options);
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
