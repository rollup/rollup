import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase } from './shared/Node';

export default class ThrowStatement extends StatementBase {
	argument: ExpressionNode;
	type: NodeType.tThrowStatement;

	hasEffects(_options: ExecutionPathOptions) {
		return true;
	}
}
