import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase, StatementNode } from './shared/Node';

export default class DoWhileStatement extends StatementBase {
	body!: StatementNode;
	test!: ExpressionNode;
	type!: NodeType.tDoWhileStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) return true;
		const {
			ignore: { breakStatements }
		} = context;
		context.ignore.breakStatements = true;
		if (this.body.hasEffects(context)) return true;
		context.ignore.breakStatements = breakStatements;
		return false;
	}

	include(includeChildrenRecursively: IncludeChildren, context: InclusionContext) {
		this.included = true;
		const breakFlow = context.breakFlow;
		this.test.include(includeChildrenRecursively, context);
		this.body.include(includeChildrenRecursively, context);
		if (context.breakFlow instanceof Set && context.breakFlow.has(null)) {
			context.breakFlow = breakFlow;
		}
	}
}
