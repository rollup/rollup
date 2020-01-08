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
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER,
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

	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];
	private isBranchResolutionAnalysed = false;
	private usedBranch: ExpressionNode | null = null;
	private wasPathDeoptimizedWhileOptimized = false;

	bind() {
		super.bind();
		// ensure the usedBranch is set for the tree-shaking passes
		this.getUsedBranch();
	}

	deoptimizeCache() {
		if (this.usedBranch !== null) {
			const unusedBranch = this.usedBranch === this.consequent ? this.alternate : this.consequent;
			this.usedBranch = null;
			const expressionsToBeDeoptimized = this.expressionsToBeDeoptimized;
			this.expressionsToBeDeoptimized = [];
			if (this.wasPathDeoptimizedWhileOptimized) {
				unusedBranch.deoptimizePath(UNKNOWN_PATH);
			}
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length > 0) {
			const usedBranch = this.getUsedBranch();
			if (usedBranch === null) {
				this.consequent.deoptimizePath(path);
				this.alternate.deoptimizePath(path);
			} else {
				this.wasPathDeoptimizedWhileOptimized = true;
				usedBranch.deoptimizePath(path);
			}
		}
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
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		const usedBranch = this.getUsedBranch();
		if (usedBranch === null)
			return new MultiExpression([
				this.consequent.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin),
				this.alternate.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			]);
		this.expressionsToBeDeoptimized.push(origin);
		return usedBranch.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
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
			this.test.shouldBeIncluded(context) ||
			this.usedBranch === null
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
				removeLineBreaks(code, inclusionStart, this.usedBranch!.start);
			}
			code.remove(this.start, inclusionStart);
			if (this.consequent.included) {
				code.remove(colonPos, this.end);
			}
			removeAnnotations(this, code);
			this.usedBranch!.render(code, options, {
				isCalleeOfRenderedParent: renderedParentType
					? isCalleeOfRenderedParent
					: (this.parent as CallExpression).callee === this,
				renderedParentType: renderedParentType || this.parent.type
			});
		} else {
			super.render(code, options);
		}
	}

	private getUsedBranch() {
		if (this.isBranchResolutionAnalysed) {
			return this.usedBranch;
		}
		this.isBranchResolutionAnalysed = true;
		const testValue = this.test.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
		return testValue === UnknownValue
			? null
			: (this.usedBranch = testValue ? this.consequent : this.alternate);
	}
}
