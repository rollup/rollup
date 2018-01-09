import ExecutionPathOptions from '../ExecutionPathOptions';
import { StatementBase, StatementNode } from './shared/Statement';
import { ExpressionNode } from './shared/Expression';

export default class WhileStatement extends StatementBase {
	type: 'WhileStatement';
	test: ExpressionNode;
	body: StatementNode;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
