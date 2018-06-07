import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase, StatementNode } from './shared/Node';

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
