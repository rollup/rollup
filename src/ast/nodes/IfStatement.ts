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

	private isTestValueAnalysed = false;
	private testValue: LiteralValueOrUnknown;

	bind() {
		super.bind();
		if (!this.isTestValueAnalysed) {
			this.testValue = UnknownValue;
			this.isTestValueAnalysed = true;
			this.testValue = this.test.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
		}
	}

	deoptimizeCache() {
		this.testValue = UnknownValue;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) return true;
		if (this.testValue === UnknownValue) {
			return (
				this.consequent.hasEffects(context) ||
				(this.alternate !== null && this.alternate.hasEffects(context))
			);
		}
		return this.testValue
			? this.consequent.hasEffects(context)
			: this.alternate !== null && this.alternate.hasEffects(context);
	}

	include(includeChildrenRecursively: IncludeChildren, context: InclusionContext) {
		this.included = true;
		if (includeChildrenRecursively) {
			this.test.include(includeChildrenRecursively, context);
			this.consequent.include(includeChildrenRecursively, context);
			if (this.alternate !== null) {
				this.alternate.include(includeChildrenRecursively, context);
			}
		} else if (this.testValue === UnknownValue) {
			this.test.include(false, context);
			const breakFlow = context.breakFlow;
			let consequentBreakFlow: BreakFlow | false = false;
			if (this.consequent.shouldBeIncluded(context)) {
				this.consequent.include(false, context);
				consequentBreakFlow = context.breakFlow;
				context.breakFlow = breakFlow;
			}
			if (this.alternate !== null && this.alternate.shouldBeIncluded(context)) {
				this.alternate.include(false, context);
				if (!consequentBreakFlow) {
					context.breakFlow = BREAKFLOW_NONE;
				}
			}
		} else {
			if (this.test.shouldBeIncluded(context)) {
				this.test.include(false, context);
			}
			if (this.testValue && this.consequent.shouldBeIncluded(context)) {
				this.consequent.include(false, context);
			}
			if (this.alternate !== null && !this.testValue && this.alternate.shouldBeIncluded(context)) {
				this.alternate.include(false, context);
			}
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
}
