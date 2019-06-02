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
				this.left.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin),
				this.right.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			]);
		this.expressionsToBeDeoptimized.push(origin);
		return this.usedBranch.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.usedBranch === null) {
			return this.left.hasEffects(options) || this.right.hasEffects(options);
		}
		return this.usedBranch.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return false;
		if (this.usedBranch === null) {
			return (
				this.left.hasEffectsWhenAccessedAtPath(path, options) ||
				this.right.hasEffectsWhenAccessedAtPath(path, options)
			);
		}
		return this.usedBranch.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return true;
		if (this.usedBranch === null) {
			return (
				this.left.hasEffectsWhenAssignedAtPath(path, options) ||
				this.right.hasEffectsWhenAssignedAtPath(path, options)
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
				this.left.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
				this.right.hasEffectsWhenCalledAtPath(path, callOptions, options)
			);
		}
		return this.usedBranch.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	include(includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (
			includeChildrenRecursively ||
			this.usedBranch === null ||
			(this.unusedBranch as ExpressionNode).shouldBeIncluded()
		) {
			this.left.include(includeChildrenRecursively);
			this.right.include(includeChildrenRecursively);
		} else {
			this.usedBranch.include(includeChildrenRecursively);
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.left.included || !this.right.included) {
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
		const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
		if (leftValue !== UNKNOWN_VALUE) {
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
