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
import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { ExpressionEntity, LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { MultiExpression } from './shared/MultiExpression';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

export type LogicalOperator = '||' | '&&' | '??';

export default class LogicalExpression extends NodeBase implements DeoptimizableEntity {
	left!: ExpressionNode;
	operator!: LogicalOperator;
	right!: ExpressionNode;
	type!: NodeType.tLogicalExpression;

	// We collect deoptimization information if usedBranch !== null
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private isBranchResolutionAnalysed = false;
	private usedBranch: ExpressionNode | null = null;

	deoptimizeCache(): void {
		if (this.usedBranch !== null) {
			const unusedBranch = this.usedBranch === this.left ? this.right : this.left;
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
			this.left.deoptimizePath(path);
			this.right.deoptimizePath(path);
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
		this.left.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
		this.right.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
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
				this.left.getReturnExpressionWhenCalledAtPath(path, callOptions, recursionTracker, origin),
				this.right.getReturnExpressionWhenCalledAtPath(path, callOptions, recursionTracker, origin)
			]);
		this.expressionsToBeDeoptimized.push(origin);
		return usedBranch.getReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
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

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) {
			return (
				this.left.hasEffectsWhenAccessedAtPath(path, context) ||
				this.right.hasEffectsWhenAccessedAtPath(path, context)
			);
		}
		return usedBranch.hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null) {
			return (
				this.left.hasEffectsWhenAssignedAtPath(path, context) ||
				this.right.hasEffectsWhenAssignedAtPath(path, context)
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
				this.left.hasEffectsWhenCalledAtPath(path, callOptions, context) ||
				this.right.hasEffectsWhenCalledAtPath(path, callOptions, context)
			);
		}
		return usedBranch.hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		const usedBranch = this.getUsedBranch();
		if (
			includeChildrenRecursively ||
			(usedBranch === this.right && this.left.shouldBeIncluded(context)) ||
			usedBranch === null
		) {
			this.left.include(context, includeChildrenRecursively);
			this.right.include(context, includeChildrenRecursively);
		} else {
			usedBranch.include(context, includeChildrenRecursively);
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, preventASI }: NodeRenderOptions = BLANK
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
			} else {
				code.remove(operatorPos, this.end);
			}
			removeAnnotations(this, code);
			this.getUsedBranch()!.render(code, options, {
				isCalleeOfRenderedParent: renderedParentType
					? isCalleeOfRenderedParent
					: (this.parent as CallExpression).callee === this,
				preventASI,
				renderedParentType: renderedParentType || this.parent.type
			});
		} else {
			this.left.render(code, options, { preventASI });
			this.right.render(code, options);
		}
	}

	private getUsedBranch() {
		if (!this.isBranchResolutionAnalysed) {
			this.isBranchResolutionAnalysed = true;
			const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
			if (leftValue === UnknownValue) {
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
