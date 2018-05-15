import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase, StatementNode } from './shared/Node';

export default class WhileStatement extends StatementBase {
	type: NodeType.tWhileStatement;
	test: ExpressionNode;
	body: StatementNode;

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) || this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
