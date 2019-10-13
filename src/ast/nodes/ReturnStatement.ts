import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { BREAKFLOW_ERROR_RETURN, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { UNKNOWN_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase } from './shared/Node';

export default class ReturnStatement extends StatementBase {
	argument!: ExpressionNode | null;
	type!: NodeType.tReturnStatement;

	hasEffects(context: HasEffectsContext) {
		if (
			!context.ignore.returnAwaitYield ||
			(this.argument !== null && this.argument.hasEffects(context))
		)
			return true;
		context.breakFlow = BREAKFLOW_ERROR_RETURN;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		if (this.argument) {
			this.argument.include(context, includeChildrenRecursively);
		}
		context.breakFlow = BREAKFLOW_ERROR_RETURN;
	}

	initialise() {
		this.scope.addReturnExpression(this.argument || UNKNOWN_EXPRESSION);
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.argument) {
			this.argument.render(code, options, { preventASI: true });
			if (this.argument.start === this.start + 6 /* 'return'.length */) {
				code.prependLeft(this.start + 6, ' ');
			}
		}
	}
}
