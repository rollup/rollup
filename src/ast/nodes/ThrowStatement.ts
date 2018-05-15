import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase } from './shared/Node';

export default class ThrowStatement extends StatementBase {
	type: NodeType.tThrowStatement;
	argument: ExpressionNode;

	hasEffects(_options: ExecutionPathOptions) {
		return true;
	}
}
