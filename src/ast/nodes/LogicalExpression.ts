import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
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
	// We collect deoptimization information if leftValue !== UNKNOWN_VALUE
	private leftValue: LiteralValueOrUnknown;
	private needsLeftValue: boolean;
	private isOrExpression: boolean;
	private expressionsToBeDeoptimized: Set<DeoptimizableEntity>;

	bind() {
		super.bind();
		if (this.needsLeftValue) this.updateLeftValue();
	}

	deoptimize() {
		if (this.leftValue !== UNKNOWN_VALUE) {
			// We did not track if there were reassignments to any of the branches.
			// Also, the return values might need reassignment.
			const previousUntrackedBranch = (this.isOrExpression
			? this.leftValue
			: !this.leftValue)
				? this.right
				: this.left;
			this.leftValue = UNKNOWN_VALUE;
			previousUntrackedBranch.reassignPath(UNKNOWN_PATH);
			this.expressionsToBeDeoptimized.forEach(node => node.deoptimize());
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.needsLeftValue) this.updateLeftValue();
		if (this.leftValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;
		this.expressionsToBeDeoptimized.add(origin);
		if (this.isOrExpression ? this.leftValue : !this.leftValue) return this.leftValue;
		return this.right.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.needsLeftValue) this.updateLeftValue();
		if (this.leftValue === UNKNOWN_VALUE)
			return new MultiExpression([
				this.left.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin),
				this.right.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			]);
		this.expressionsToBeDeoptimized.add(origin);
		if (this.isOrExpression ? this.leftValue : !this.leftValue)
			return this.left.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
		return this.right.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.left.hasEffects(options)) return true;
		return (
			(this.leftValue === UNKNOWN_VALUE ||
				(this.isOrExpression ? !this.leftValue : this.leftValue)) &&
			this.right.hasEffects(options)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return false;
		if (this.leftValue === UNKNOWN_VALUE) {
			return (
				this.left.hasEffectsWhenAccessedAtPath(path, options) ||
				this.right.hasEffectsWhenAccessedAtPath(path, options)
			);
		}
		return (this.isOrExpression
		? this.leftValue
		: !this.leftValue)
			? this.left.hasEffectsWhenAccessedAtPath(path, options)
			: this.right.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return true;
		if (this.leftValue === UNKNOWN_VALUE) {
			return (
				this.left.hasEffectsWhenAssignedAtPath(path, options) ||
				this.right.hasEffectsWhenAssignedAtPath(path, options)
			);
		}
		return (this.isOrExpression
		? this.leftValue
		: !this.leftValue)
			? this.left.hasEffectsWhenAssignedAtPath(path, options)
			: this.right.hasEffectsWhenAssignedAtPath(path, options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (this.leftValue === UNKNOWN_VALUE) {
			return (
				this.left.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
				this.right.hasEffectsWhenCalledAtPath(path, callOptions, options)
			);
		}
		return (this.isOrExpression
		? this.leftValue
		: !this.leftValue)
			? this.left.hasEffectsWhenCalledAtPath(path, callOptions, options)
			: this.right.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	include() {
		this.included = true;
		if (
			this.leftValue === UNKNOWN_VALUE ||
			(this.isOrExpression ? this.leftValue : !this.leftValue) ||
			this.left.shouldBeIncluded()
		) {
			this.left.include();
		}
		if (
			this.leftValue === UNKNOWN_VALUE ||
			(this.isOrExpression ? !this.leftValue : this.leftValue)
		) {
			this.right.include();
		}
	}

	initialise() {
		this.included = false;
		this.needsLeftValue = true;
		this.isOrExpression = this.operator === '||';
		this.expressionsToBeDeoptimized = new Set();
	}

	reassignPath(path: ObjectPath) {
		if (path.length > 0) {
			if (this.needsLeftValue) this.updateLeftValue();
			if (this.leftValue === UNKNOWN_VALUE) {
				this.left.reassignPath(path);
				this.right.reassignPath(path);
			} else if (this.isOrExpression ? this.leftValue : !this.leftValue) {
				this.left.reassignPath(path);
			} else {
				this.right.reassignPath(path);
			}
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.left.included || !this.right.included) {
			const singleRetainedBranch = this.left.included ? this.left : this.right;
			code.remove(this.start, singleRetainedBranch.start);
			code.remove(singleRetainedBranch.end, this.end);
			singleRetainedBranch.render(code, options, {
				renderedParentType: renderedParentType || this.parent.type,
				isCalleeOfRenderedParent: renderedParentType
					? isCalleeOfRenderedParent
					: (<CallExpression>this.parent).callee === this
			});
		} else {
			super.render(code, options);
		}
	}

	private updateLeftValue() {
		this.leftValue = UNKNOWN_VALUE;
		this.needsLeftValue = false;
		this.leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
	}
}
