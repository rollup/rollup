import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	NodeRenderOptions,
	removeLineBreaks,
	RenderOptions
} from '../../utils/renderHelpers';
import { removeAnnotations } from '../../utils/treeshakeNode';
import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import {
	EMPTY_IMMUTABLE_TRACKER,
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue } from '../values';
import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { MultiExpression } from './shared/MultiExpression';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

export type LogicalOperator = '||' | '&&';

export default class LogicalExpression extends NodeBase implements DeoptimizableEntity {
	left!: ExpressionNode;
	operator!: LogicalOperator;
	right!: ExpressionNode;
	type!: NodeType.tLogicalExpression;

	// We collect deoptimization information if usedBranch !== null
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private isBranchResolutionAnalysed = false;
	private unusedBranch: ExpressionNode | null = null;
	private usedBranch: ExpressionNode | null = null;

	bind() {
		super.bind();
		if (!this.isBranchResolutionAnalysed) this.analyseBranchResolution();
	}

	deoptimizeCache() {
		if (this.usedBranch !== null) {
			// We did not track if there were reassignments to any of the branches.
			// Also, the return values might need reassignment.
			this.usedBranch = null;
			(this.unusedBranch as ExpressionNode).deoptimizePath(UNKNOWN_PATH);
			for (const expression of this.expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length > 0) {
			if (!this.isBranchResolutionAnalysed) this.analyseBranchResolution();
			if (this.usedBranch === null) {
				this.left.deoptimizePath(path);
				this.right.deoptimizePath(path);
			} else {
				this.usedBranch.deoptimizePath(path);
			}
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (!this.isBranchResolutionAnalysed) this.analyseBranchResolution();
		if (this.usedBranch === null) return UnknownValue;
		this.expressionsToBeDeoptimized.push(origin);
		return this.usedBranch.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (!this.isBranchResolutionAnalysed) this.analyseBranchResolution();
		if (this.usedBranch === null)
			return new MultiExpression([
				this.left.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin),
				this.right.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			]);
		this.expressionsToBeDeoptimized.push(origin);
		return this.usedBranch.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.usedBranch === null) {
			return this.left.hasEffects(context) || this.right.hasEffects(context);
		}
		return this.usedBranch.hasEffects(context);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return false;
		if (this.usedBranch === null) {
			return (
				this.left.hasEffectsWhenAccessedAtPath(path, context) ||
				this.right.hasEffectsWhenAccessedAtPath(path, context)
			);
		}
		return this.usedBranch.hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return true;
		if (this.usedBranch === null) {
			return (
				this.left.hasEffectsWhenAssignedAtPath(path, context) ||
				this.right.hasEffectsWhenAssignedAtPath(path, context)
			);
		}
		return this.usedBranch.hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (this.usedBranch === null) {
			return (
				this.left.hasEffectsWhenCalledAtPath(path, callOptions, context) ||
				this.right.hasEffectsWhenCalledAtPath(path, callOptions, context)
			);
		}
		return this.usedBranch.hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (
			includeChildrenRecursively ||
			this.usedBranch === null ||
			(this.unusedBranch as ExpressionNode).shouldBeIncluded(context)
		) {
			this.left.include(context, includeChildrenRecursively);
			this.right.include(context, includeChildrenRecursively);
		} else {
			this.usedBranch.include(context, includeChildrenRecursively);
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, preventASI }: NodeRenderOptions = BLANK
	) {
		if (!this.left.included || !this.right.included) {
			const operatorPos = findFirstOccurrenceOutsideComment(
				code.original,
				this.operator,
				this.left.end
			);
			if (this.right.included) {
				code.remove(this.start, operatorPos + 2);
				if (preventASI) {
					removeLineBreaks(code, operatorPos + 2, this.right.start);
				}
			} else {
				code.remove(operatorPos, this.end);
			}
			removeAnnotations(this, code);
			(this.usedBranch as ExpressionNode).render(code, options, {
				isCalleeOfRenderedParent: renderedParentType
					? isCalleeOfRenderedParent
					: (this.parent as CallExpression).callee === this,
				renderedParentType: renderedParentType || this.parent.type
			});
		} else {
			super.render(code, options);
		}
	}

	private analyseBranchResolution() {
		this.isBranchResolutionAnalysed = true;
		const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
		if (leftValue !== UnknownValue) {
			if (this.operator === '||' ? leftValue : !leftValue) {
				this.usedBranch = this.left;
				this.unusedBranch = this.right;
			} else {
				this.usedBranch = this.right;
				this.unusedBranch = this.left;
			}
		}
	}
}
