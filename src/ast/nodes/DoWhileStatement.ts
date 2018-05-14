import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionNode, StatementNode, StatementBase } from './shared/Node';
import * as NodeType from './NodeType';

export default class DoWhileStatement extends StatementBase {
	type: NodeType.tDoWhileStatement;
	body: StatementNode;
	test: ExpressionNode;

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) || this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
