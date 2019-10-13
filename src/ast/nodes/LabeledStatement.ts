import { BREAKFLOW_NONE, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { IncludeChildren, StatementBase, StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	body!: StatementNode;
	label!: Identifier;
	type!: NodeType.tLabeledStatement;

	hasEffects(context: HasEffectsContext) {
		context.ignore.labels.add(this.label.name);
		if (this.body.hasEffects(context)) return true;
		context.ignore.labels.delete(this.label.name);
		if (context.breakFlow instanceof Set && context.breakFlow.has(this.label.name)) {
			context.breakFlow = BREAKFLOW_NONE;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		this.label.include(context);
		this.body.include(context, includeChildrenRecursively);
		if (context.breakFlow instanceof Set && context.breakFlow.has(this.label.name)) {
			context.breakFlow = BREAKFLOW_NONE;
		}
	}
}
