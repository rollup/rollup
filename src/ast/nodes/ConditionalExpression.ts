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

export default class ConditionalExpression extends NodeBase implements DeoptimizableEntity {
	type: NodeType.tConditionalExpression;
	test: ExpressionNode;
	alternate: ExpressionNode;
	consequent: ExpressionNode;

	// Caching and deoptimization:
	// We collect deoptimization information if testValue !== UNKNOWN_VALUE
	private testValue: LiteralValueOrUnknown;
	private needsTestValue: boolean;
	private expressionsToBeDeoptimized: DeoptimizableEntity[];

	bind() {
		super.bind();
		if (this.needsTestValue) this.updateTestValue();
	}

	deoptimize() {
		if (this.testValue !== UNKNOWN_VALUE) {
			// We did not track if there were reassignments to the previous branch.
			// Also, the return value might need to be reassigned.
			const previousUntrackedBranch = this.testValue ? this.alternate : this.consequent;
			this.testValue = UNKNOWN_VALUE;
			previousUntrackedBranch.reassignPath(UNKNOWN_PATH);
			for (const expression of this.expressionsToBeDeoptimized) {
				expression.deoptimize();
			}
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (this.needsTestValue) this.updateTestValue();
		if (this.testValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;
		this.expressionsToBeDeoptimized.push(origin);
		return this.testValue
			? this.consequent.getLiteralValueAtPath(path, recursionTracker, origin)
			: this.alternate.getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (this.needsTestValue) this.updateTestValue();
		if (this.testValue === UNKNOWN_VALUE)
			return new MultiExpression([
				this.consequent.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin),
				this.alternate.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			]);
		this.expressionsToBeDeoptimized.push(origin);
		return this.testValue
			? this.consequent.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			: this.alternate.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.test.hasEffects(options)) return true;
		if (this.testValue === UNKNOWN_VALUE) {
			return this.consequent.hasEffects(options) || this.alternate.hasEffects(options);
		}
		return this.testValue
			? this.consequent.hasEffects(options)
			: this.alternate.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return false;
		if (this.testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.hasEffectsWhenAccessedAtPath(path, options) ||
				this.alternate.hasEffectsWhenAccessedAtPath(path, options)
			);
		}
		return this.testValue
			? this.consequent.hasEffectsWhenAccessedAtPath(path, options)
			: this.alternate.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return true;
		if (this.testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.hasEffectsWhenAssignedAtPath(path, options) ||
				this.alternate.hasEffectsWhenAssignedAtPath(path, options)
			);
		}
		return this.testValue
			? this.consequent.hasEffectsWhenAssignedAtPath(path, options)
			: this.alternate.hasEffectsWhenAssignedAtPath(path, options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (this.testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
				this.alternate.hasEffectsWhenCalledAtPath(path, callOptions, options)
			);
		}
		return this.testValue
			? this.consequent.hasEffectsWhenCalledAtPath(path, callOptions, options)
			: this.alternate.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	initialise() {
		this.included = false;
		this.needsTestValue = true;
		this.expressionsToBeDeoptimized = [];
	}

	include() {
		this.included = true;
		if (this.testValue === UNKNOWN_VALUE || this.test.shouldBeIncluded()) {
			this.test.include();
			this.consequent.include();
			this.alternate.include();
		} else if (this.testValue) {
			this.consequent.include();
		} else {
			this.alternate.include();
		}
	}

	reassignPath(path: ObjectPath) {
		if (path.length > 0) {
			if (this.needsTestValue) this.updateTestValue();
			if (this.testValue === UNKNOWN_VALUE) {
				this.consequent.reassignPath(path);
				this.alternate.reassignPath(path);
			} else if (this.testValue) {
				this.consequent.reassignPath(path);
			} else {
				this.alternate.reassignPath(path);
			}
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.test.included) {
			const singleRetainedBranch = this.consequent.included ? this.consequent : this.alternate;
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

	private updateTestValue() {
		this.testValue = UNKNOWN_VALUE;
		this.needsTestValue = false;
		this.testValue = this.test.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
	}
}
