import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { removeAnnotations } from '../../utils/treeshakeNode';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { BreakFlow, EffectsExecutionContext, ExecutionContext } from '../ExecutionContext';
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

	hasEffects(context: EffectsExecutionContext): boolean {
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

	// TODO Lukas simplify type for BreakFlow to Symbol or Set of labels
	// TODO Lukas change logic to handle unknown test separately
	include(includeChildrenRecursively: IncludeChildren, context: ExecutionContext) {
		this.included = true;
		if (includeChildrenRecursively) {
			this.test.include(includeChildrenRecursively, context);
			this.consequent.include(includeChildrenRecursively, context);
			if (this.alternate !== null) {
				this.alternate.include(includeChildrenRecursively, context);
			}
			return;
		}
		const hasUnknownTest = this.testValue === UnknownValue;
		if (hasUnknownTest || this.test.shouldBeIncluded(context)) {
			this.test.include(false, context);
		}
		if ((hasUnknownTest || this.testValue) && this.consequent.shouldBeIncluded(context)) {
			this.consequent.include(false, context);
		}
		let consequentBreakFlow: BreakFlow | false = false;
		if (hasUnknownTest) {
			consequentBreakFlow = context.breakFlow;
			context.breakFlow = false;
		}
		if (
			this.alternate !== null &&
			((hasUnknownTest || !this.testValue) && this.alternate.shouldBeIncluded(context))
		) {
			this.alternate.include(false, context);
		}
		if (hasUnknownTest && !consequentBreakFlow) {
			context.breakFlow = false;
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
