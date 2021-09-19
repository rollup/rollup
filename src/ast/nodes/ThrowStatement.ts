import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { BROKEN_FLOW_ERROR_RETURN_LABEL, InclusionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase } from './shared/Node';

export default class ThrowStatement extends StatementBase {
	declare argument: ExpressionNode;
	declare type: NodeType.tThrowStatement;

	hasEffects(): boolean {
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.argument.include(context, includeChildrenRecursively);
		context.brokenFlow = BROKEN_FLOW_ERROR_RETURN_LABEL;
	}

	render(code: MagicString, options: RenderOptions): void {
		this.argument.render(code, options, { preventASI: true });
		if (this.argument.start === this.start + 5 /* 'throw'.length */) {
			code.prependLeft(this.start + 5, ' ');
		}
	}
}
