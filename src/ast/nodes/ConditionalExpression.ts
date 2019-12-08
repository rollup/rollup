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

export default class ConditionalExpression extends NodeBase implements DeoptimizableEntity {
	alternate!: ExpressionNode;
	consequent!: ExpressionNode;
	test!: ExpressionNode;
	type!: NodeType.tConditionalExpression;

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
			// We did not track if there were reassignments to the previous branch.
			// Also, the return value might need to be reassigned.
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
				this.consequent.deoptimizePath(path);
				this.alternate.deoptimizePath(path);
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
				this.consequent.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin),
				this.alternate.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			]);
		this.expressionsToBeDeoptimized.push(origin);
		return this.usedBranch.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) return true;
		if (this.usedBranch === null) {
			return this.consequent.hasEffects(context) || this.alternate.hasEffects(context);
		}
		return this.usedBranch.hasEffects(context);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return false;
		if (this.usedBranch === null) {
			return (
				this.consequent.hasEffectsWhenAccessedAtPath(path, context) ||
				this.alternate.hasEffectsWhenAccessedAtPath(path, context)
			);
		}
		return this.usedBranch.hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return true;
		if (this.usedBranch === null) {
			return (
				this.consequent.hasEffectsWhenAssignedAtPath(path, context) ||
				this.alternate.hasEffectsWhenAssignedAtPath(path, context)
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
				this.consequent.hasEffectsWhenCalledAtPath(path, callOptions, context) ||
				this.alternate.hasEffectsWhenCalledAtPath(path, callOptions, context)
			);
		}
		return this.usedBranch.hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (
			includeChildrenRecursively ||
			this.usedBranch === null ||
			this.test.shouldBeIncluded(context)
		) {
			this.test.include(context, includeChildrenRecursively);
			this.consequent.include(context, includeChildrenRecursively);
			this.alternate.include(context, includeChildrenRecursively);
		} else {
			this.usedBranch.include(context, includeChildrenRecursively);
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, preventASI }: NodeRenderOptions = BLANK
	) {
		if (!this.test.included) {
			const colonPos = findFirstOccurrenceOutsideComment(code.original, ':', this.consequent.end);
			const inclusionStart =
				(this.consequent.included
					? findFirstOccurrenceOutsideComment(code.original, '?', this.test.end)
					: colonPos) + 1;
			if (preventASI) {
				removeLineBreaks(code, inclusionStart, (this.usedBranch as ExpressionNode).start);
			}
			code.remove(this.start, inclusionStart);
			if (this.consequent.included) {
				code.remove(colonPos, this.end);
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
		const testValue = this.test.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
		if (testValue !== UnknownValue) {
			if (testValue) {
				this.usedBranch = this.consequent;
				this.unusedBranch = this.alternate;
			} else {
				this.usedBranch = this.alternate;
				this.unusedBranch = this.consequent;
			}
		}
	}
}
