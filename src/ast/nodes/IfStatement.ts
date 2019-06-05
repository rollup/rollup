import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { removeAnnotations } from '../../utils/treeshakeNode';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_IMMUTABLE_TRACKER } from '../utils/ImmutableEntityPathTracker';
import { EMPTY_PATH, LiteralValueOrUnknown, UNKNOWN_VALUE } from '../values';
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
			this.testValue = UNKNOWN_VALUE;
			this.isTestValueAnalysed = true;
			this.testValue = this.test.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this);
		}
	}

	deoptimizeCache() {
		this.testValue = UNKNOWN_VALUE;
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.test.hasEffects(options)) return true;
		if (this.testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.hasEffects(options) ||
				(this.alternate !== null && this.alternate.hasEffects(options))
			);
		}
		return this.testValue
			? this.consequent.hasEffects(options)
			: this.alternate !== null && this.alternate.hasEffects(options);
	}

	include(includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (includeChildrenRecursively) {
			this.test.include(includeChildrenRecursively);
			this.consequent.include(includeChildrenRecursively);
			if (this.alternate !== null) {
				this.alternate.include(includeChildrenRecursively);
			}
			return;
		}
		const hasUnknownTest = this.testValue === UNKNOWN_VALUE;
		if (hasUnknownTest || this.test.shouldBeIncluded()) {
			this.test.include(false);
		}
		if ((hasUnknownTest || this.testValue) && this.consequent.shouldBeIncluded()) {
			this.consequent.include(false);
		}
		if (
			this.alternate !== null &&
			((hasUnknownTest || !this.testValue) && this.alternate.shouldBeIncluded())
		) {
			this.alternate.include(false);
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
