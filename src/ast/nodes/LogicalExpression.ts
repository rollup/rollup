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

export type LogicalOperator = '||' | '&&';

export default class LogicalExpression extends NodeBase implements DeoptimizableEntity {
	type: NodeType.tLogicalExpression;
	operator: LogicalOperator;
	left: ExpressionNode;
	right: ExpressionNode;

	// Caching and deoptimization:
	// We collect deoptimization information if usedBranch !== null
	private isBranchResolutionAnalysed: boolean;
	private usedBranch: ExpressionNode | null;
	private unusedBranch: ExpressionNode | null;
	private expressionsToBeDeoptimized: DeoptimizableEntity[];

	bind() {
		super.bind();
		if (!this.isBranchResolutionAnalysed) this.analyseBranchResolution();
	}

	deoptimizeCache() {
		if (this.usedBranch !== null) {
			// We did not track if there were reassignments to any of the branches.
			// Also, the return values might need reassignment.
			this.usedBranch = null;
			this.unusedBranch.deoptimizePath(UNKNOWN_PATH);
			for (const expression of this.expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
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

	include(includeAllChildrenRecursively: boolean) {
		this.included = true;
		if (
			includeAllChildrenRecursively ||
			this.usedBranch === null ||
			this.unusedBranch.shouldBeIncluded()
		) {
			this.left.include(includeAllChildrenRecursively);
			this.right.include(includeAllChildrenRecursively);
		} else {
			this.usedBranch.include(includeAllChildrenRecursively);
		}
	}

	initialise() {
		this.included = false;
		this.isBranchResolutionAnalysed = false;
		this.usedBranch = null;
		this.unusedBranch = null;
		this.expressionsToBeDeoptimized = [];
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

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.left.included || !this.right.included) {
			code.remove(this.start, this.usedBranch.start);
			code.remove(this.usedBranch.end, this.end);
			removeAnnotations(this, code);
			this.usedBranch.render(code, options, {
				renderedParentType: renderedParentType || this.parent.type,
				isCalleeOfRenderedParent: renderedParentType
					? isCalleeOfRenderedParent
					: (<CallExpression>this.parent).callee === this
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
