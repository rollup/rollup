import { BREAKFLOW_NONE, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { IncludeChildren, StatementBase, StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	body!: StatementNode;
	label!: Identifier;
	type!: NodeType.tLabeledStatement;

	hasEffects(context: HasEffectsContext) {
		const {
			ignore: { breakStatements }
		} = context;
		context.ignore.breakStatements = true;
		context.ignore.labels.add(this.label.name);
		if (this.body.hasEffects(context)) return true;
		context.ignore.breakStatements = breakStatements;
		context.ignore.labels.delete(this.label.name);
		if (context.breakFlow instanceof Set && context.breakFlow.has(this.label.name)) {
			context.breakFlow = BREAKFLOW_NONE;
		}
		return false;
	}

	include(includeChildrenRecursively: IncludeChildren, context: InclusionContext) {
		this.included = true;
		this.label.include();
		this.body.include(includeChildrenRecursively, context);
		if (context.breakFlow instanceof Set && context.breakFlow.has(this.label.name)) {
			context.breakFlow = BREAKFLOW_NONE;
		}
	}
}
