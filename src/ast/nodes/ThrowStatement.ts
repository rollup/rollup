import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { BreakFlow, InclusionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase } from './shared/Node';

export default class ThrowStatement extends StatementBase {
	argument!: ExpressionNode;
	type!: NodeType.tThrowStatement;

	hasEffects() {
		return true;
	}

	render(code: MagicString, options: RenderOptions) {
		this.argument.render(code, options, { preventASI: true });
	}

	shouldBeIncluded(context: InclusionContext): boolean {
		if (context.breakFlow) return false;
		context.breakFlow = BreakFlow.Error;
		return true;
	}
}
