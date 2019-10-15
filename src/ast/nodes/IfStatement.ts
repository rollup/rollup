import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { removeAnnotations } from '../../utils/treeshakeNode';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import {
	BreakFlow,
	BREAKFLOW_NONE,
	HasEffectsContext,
	InclusionContext
} from '../ExecutionContext';
import { EMPTY_IMMUTABLE_TRACKER, EMPTY_PATH } from '../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase, StatementNode } from './shared/Node';

export default class IfStatement extends StatementBase implements DeoptimizableEntity {
	alternate!: StatementNode | null;
	consequent!: StatementNode;
	test!: ExpressionNode;
	type!: NodeType.tIfStatement;

	private testValue: LiteralValueOrUnknown;

	bind() {
		super.bind();
		this.testValue = this.test.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
	}

	deoptimizeCache() {
		this.testValue = UnknownValue;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) return true;
		if (this.testValue === UnknownValue) {
			const { breakFlow } = context;
			if (this.consequent.hasEffects(context)) return true;
			const consequentBreakFlow = context.breakFlow;
			context.breakFlow = breakFlow;
			if (this.alternate === null) return false;
			if (this.alternate.hasEffects(context)) return true;
			this.updateBreakFlowUnknownCondition(consequentBreakFlow, context);
			return false;
		}
		return this.testValue
			? this.consequent.hasEffects(context)
			: this.alternate !== null && this.alternate.hasEffects(context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (includeChildrenRecursively) {
			this.includeRecursively(includeChildrenRecursively, context);
		} else if (this.testValue === UnknownValue) {
			this.includeUnknownTest(context);
		} else {
			this.includeKnownTest(context);
		}
	}

	render(code: MagicString, options: RenderOptions) {
		// Note that unknown test values are always included
		if (
			!this.test.included &&
			(this.testValue
				? this.alternate === null || !this.alternate.included
				: !this.consequent.included)
		) {
			const singleRetainedBranch = (this.testValue
				? this.consequent
				: this.alternate) as StatementNode;
			code.remove(this.start, singleRetainedBranch.start);
			code.remove(singleRetainedBranch.end, this.end);
			removeAnnotations(this, code);
			singleRetainedBranch.render(code, options);
		} else {
			if (this.test.included) {
				this.test.render(code, options);
			} else {
				code.overwrite(this.test.start, this.test.end, this.testValue ? 'true' : 'false');
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

	private includeKnownTest(context: InclusionContext) {
		if (this.test.shouldBeIncluded(context)) {
			this.test.include(context, false);
		}
		if (this.testValue && this.consequent.shouldBeIncluded(context)) {
			this.consequent.include(context, false);
		}
		if (this.alternate !== null && !this.testValue && this.alternate.shouldBeIncluded(context)) {
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
		const { breakFlow } = context;
		let consequentBreakFlow: BreakFlow | false = false;
		if (this.consequent.shouldBeIncluded(context)) {
			this.consequent.include(context, false);
			consequentBreakFlow = context.breakFlow;
			context.breakFlow = breakFlow;
		}
		if (this.alternate !== null && this.alternate.shouldBeIncluded(context)) {
			this.alternate.include(context, false);
			this.updateBreakFlowUnknownCondition(consequentBreakFlow, context);
		}
	}

	private updateBreakFlowUnknownCondition(
		consequentBreakFlow: BreakFlow | false,
		context: InclusionContext
	) {
		if (!(consequentBreakFlow && context.breakFlow)) {
			context.breakFlow = BREAKFLOW_NONE;
		} else if (context.breakFlow instanceof Set) {
			if (consequentBreakFlow instanceof Set) {
				for (const label of consequentBreakFlow) {
					context.breakFlow.add(label);
				}
			}
		} else {
			context.breakFlow = consequentBreakFlow;
		}
	}
}
