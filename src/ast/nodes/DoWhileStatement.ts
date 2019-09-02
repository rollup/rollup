import { ExecutionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase, StatementNode } from './shared/Node';

export default class DoWhileStatement extends StatementBase {
	body!: StatementNode;
	test!: ExpressionNode;
	type!: NodeType.tDoWhileStatement;

	hasEffects(context: ExecutionContext): boolean {
		if (this.test.hasEffects(context)) return true;
		const { ignoreBreakStatements } = context;
		context.ignoreBreakStatements = true;
		if (this.body.hasEffects(context)) return true;
		context.ignoreBreakStatements = ignoreBreakStatements;
		return false;
	}
}
