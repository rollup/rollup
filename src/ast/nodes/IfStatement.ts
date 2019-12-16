import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { removeAnnotations } from '../../utils/treeshakeNode';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { BROKEN_FLOW_NONE, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase, StatementNode } from './shared/Node';

const unset = Symbol('unset');

export default class IfStatement extends StatementBase implements DeoptimizableEntity {
	alternate!: StatementNode | null;
	consequent!: StatementNode;
	test!: ExpressionNode;
	type!: NodeType.tIfStatement;

	private testValue: LiteralValueOrUnknown | typeof unset = unset;

	deoptimizeCache() {
		this.testValue = UnknownValue;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) {
			return true;
		}
		const testValue = this.getTestValue();
		if (testValue === UnknownValue) {
			const { brokenFlow } = context;
			if (this.consequent.hasEffects(context)) return true;
			const consequentBrokenFlow = context.brokenFlow;
			context.brokenFlow = brokenFlow;
			if (this.alternate === null) return false;
			if (this.alternate.hasEffects(context)) return true;
			context.brokenFlow =
				context.brokenFlow < consequentBrokenFlow ? context.brokenFlow : consequentBrokenFlow;
			return false;
		}
		return testValue
			? this.consequent.hasEffects(context)
			: this.alternate !== null && this.alternate.hasEffects(context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (includeChildrenRecursively) {
			this.includeRecursively(includeChildrenRecursively, context);
		} else {
			const testValue = this.getTestValue();
			if (testValue === UnknownValue) {
				this.includeUnknownTest(context);
			} else {
				this.includeKnownTest(context, testValue);
			}
		}
	}

	render(code: MagicString, options: RenderOptions) {
		// Note that unknown test values are always included
		const testValue = this.getTestValue();
		if (
			!this.test.included &&
			(testValue ? this.alternate === null || !this.alternate.included : !this.consequent.included)
		) {
			const singleRetainedBranch = (testValue ? this.consequent : this.alternate)!;
			code.remove(this.start, singleRetainedBranch.start);
			code.remove(singleRetainedBranch.end, this.end);
			removeAnnotations(this, code);
			singleRetainedBranch.render(code, options);
		} else {
			if (this.test.included) {
				this.test.render(code, options);
			} else {
				code.overwrite(this.test.start, this.test.end, testValue ? 'true' : 'false');
			}
			if (this.consequent.included) {
				this.consequent.render(code, options);
			} else {
				code.overwrite(this.consequent.start, this.consequent.end, ';');
			}
			if (this.alternate !== null) {
				if (this.alternate.included) {
					this.alternate.render(code, options);
				} else {
					code.remove(this.consequent.end, this.alternate.end);
				}
			}
		}
	}

	private getTestValue(): LiteralValueOrUnknown {
		if (this.testValue === unset) {
			return (this.testValue = this.test.getLiteralValueAtPath(
				EMPTY_PATH,
				SHARED_RECURSION_TRACKER,
				this
			));
		}
		return this.testValue;
	}

	private includeKnownTest(context: InclusionContext, testValue: LiteralValueOrUnknown) {
		if (this.test.shouldBeIncluded(context)) {
			this.test.include(context, false);
		}
		if (testValue && this.consequent.shouldBeIncluded(context)) {
			this.consequent.include(context, false);
		}
		if (this.alternate !== null && !testValue && this.alternate.shouldBeIncluded(context)) {
			this.alternate.include(context, false);
		}
	}

	private includeRecursively(
		includeChildrenRecursively: true | 'variables',
		context: InclusionContext
	) {
		this.test.include(context, includeChildrenRecursively);
		this.consequent.include(context, includeChildrenRecursively);
		if (this.alternate !== null) {
			this.alternate.include(context, includeChildrenRecursively);
		}
	}

	private includeUnknownTest(context: InclusionContext) {
		this.test.include(context, false);
		const { brokenFlow } = context;
		let consequentBrokenFlow = BROKEN_FLOW_NONE;
		if (this.consequent.shouldBeIncluded(context)) {
			this.consequent.include(context, false);
			consequentBrokenFlow = context.brokenFlow;
			context.brokenFlow = brokenFlow;
		}
		if (this.alternate !== null && this.alternate.shouldBeIncluded(context)) {
			this.alternate.include(context, false);
			context.brokenFlow =
				context.brokenFlow < consequentBrokenFlow ? context.brokenFlow : consequentBrokenFlow;
		}
	}
}
