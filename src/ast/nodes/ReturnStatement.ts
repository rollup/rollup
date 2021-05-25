import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import {
	BROKEN_FLOW_ERROR_RETURN_LABEL,
	HasEffectsContext,
	InclusionContext
} from '../ExecutionContext';
import * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { ExpressionNode, IncludeChildren, StatementBase } from './shared/Node';

export default class ReturnStatement extends StatementBase {
	argument!: ExpressionNode | null;
	type!: NodeType.tReturnStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (
			!context.ignore.returnAwaitYield ||
			(this.argument !== null && this.argument.hasEffects(context))
		)
			return true;
		context.brokenFlow = BROKEN_FLOW_ERROR_RETURN_LABEL;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		if (this.argument) {
			this.argument.include(context, includeChildrenRecursively);
		}
		context.brokenFlow = BROKEN_FLOW_ERROR_RETURN_LABEL;
	}

	initialise(): void {
		this.scope.addReturnExpression(this.argument || UNKNOWN_EXPRESSION);
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.argument) {
			this.argument.render(code, options, { preventASI: true });
			if (this.argument.start === this.start + 6 /* 'return'.length */) {
				code.prependLeft(this.start + 6, ' ');
			}
		}
	}
}
