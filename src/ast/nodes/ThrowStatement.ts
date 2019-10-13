import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { BREAKFLOW_ERROR_RETURN, InclusionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase } from './shared/Node';

export default class ThrowStatement extends StatementBase {
	argument!: ExpressionNode;
	type!: NodeType.tThrowStatement;

	hasEffects() {
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		this.argument.include(context, includeChildrenRecursively);
		context.breakFlow = BREAKFLOW_ERROR_RETURN;
	}

	render(code: MagicString, options: RenderOptions) {
		this.argument.render(code, options, { preventASI: true });
	}
}
