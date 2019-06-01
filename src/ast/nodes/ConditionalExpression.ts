import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { removeAnnotations } from '../../utils/treeshakeNode';
import CallOptions from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	EMPTY_IMMUTABLE_TRACKER,
	ImmutableEntityPathTracker
} from '../utils/ImmutableEntityPathTracker';
import {
	EMPTY_PATH,
	LiteralValueOrUnknown,
	ObjectPath,
	UNKNOWN_PATH,
	UNKNOWN_VALUE
} from '../values';
import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { MultiExpression } from './shared/MultiExpression';
import { ExpressionNode, NodeBase } from './shared/Node';

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
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (!this.isBranchResolutionAnalysed) this.analyseBranchResolution();
		if (this.usedBranch === null) return UNKNOWN_VALUE;
		this.expressionsToBeDeoptimized.push(origin);
		return this.usedBranch.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
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

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.test.hasEffects(options)) return true;
		if (this.usedBranch === null) {
			return this.consequent.hasEffects(options) || this.alternate.hasEffects(options);
		}
		return this.usedBranch.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return false;
		if (this.usedBranch === null) {
			return (
				this.consequent.hasEffectsWhenAccessedAtPath(path, options) ||
				this.alternate.hasEffectsWhenAccessedAtPath(path, options)
			);
		}
		return this.usedBranch.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return true;
		if (this.usedBranch === null) {
			return (
				this.consequent.hasEffectsWhenAssignedAtPath(path, options) ||
				this.alternate.hasEffectsWhenAssignedAtPath(path, options)
			);
		}
		return this.usedBranch.hasEffectsWhenAssignedAtPath(path, options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (this.usedBranch === null) {
			return (
				this.consequent.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
				this.alternate.hasEffectsWhenCalledAtPath(path, callOptions, options)
			);
		}
		return this.usedBranch.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	include(includeAllChildrenRecursively: boolean) {
		this.included = true;
		if (includeAllChildrenRecursively || this.usedBranch === null || this.test.shouldBeIncluded()) {
			this.test.include(includeAllChildrenRecursively);
			this.consequent.include(includeAllChildrenRecursively);
			this.alternate.include(includeAllChildrenRecursively);
		} else {
			this.usedBranch.include(includeAllChildrenRecursively);
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.test.included) {
			code.remove(this.start, (this.usedBranch as ExpressionNode).start);
			code.remove((this.usedBranch as ExpressionNode).end, this.end);
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
		if (testValue !== UNKNOWN_VALUE) {
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
