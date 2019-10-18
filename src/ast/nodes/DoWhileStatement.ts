import {
	BROKEN_FLOW_BREAK_CONTINUE,
	HasEffectsContext,
	InclusionContext
} from '../ExecutionContext';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase, StatementNode } from './shared/Node';

export default class DoWhileStatement extends StatementBase {
	body!: StatementNode;
	test!: ExpressionNode;
	type!: NodeType.tDoWhileStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) return true;
		const {
			brokenFlow,
			ignore: { breakStatements }
		} = context;
		context.ignore.breakStatements = true;
		if (this.body.hasEffects(context)) return true;
		context.ignore.breakStatements = breakStatements;
		if (context.brokenFlow === BROKEN_FLOW_BREAK_CONTINUE) {
			context.brokenFlow = brokenFlow;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		this.test.include(context, includeChildrenRecursively);
		const { brokenFlow } = context;
		this.body.include(context, includeChildrenRecursively);
		if (context.brokenFlow === BROKEN_FLOW_BREAK_CONTINUE) {
			context.brokenFlow = brokenFlow;
		}
	}
}
