import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { ExecutionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase } from './shared/Node';

export default class ThrowStatement extends StatementBase {
	argument!: ExpressionNode;
	type!: NodeType.tThrowStatement;

	hasEffects(_context: ExecutionContext) {
		return true;
	}

	render(code: MagicString, options: RenderOptions) {
		this.argument.render(code, options, { preventASI: true });
	}
}
