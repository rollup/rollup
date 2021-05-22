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
			brokenFlow,
			ignore: { breaks, continues }
		} = context;
		context.ignore.breaks = true;
		context.ignore.continues = true;
		if (this.body.hasEffects(context)) return true;
		context.ignore.breaks = breaks;
		context.ignore.continues = continues;
		context.brokenFlow = brokenFlow;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.test.include(context, includeChildrenRecursively);
		const { brokenFlow } = context;
		this.body.includeAsSingleStatement(context, includeChildrenRecursively);
		context.brokenFlow = brokenFlow;
	}
}
