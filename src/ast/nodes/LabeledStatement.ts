import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { IncludeChildren, StatementBase, StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	body!: StatementNode;
	label!: Identifier;
	type!: NodeType.tLabeledStatement;

	hasEffects(context: HasEffectsContext) {
		const breakFlow = context.breakFlow;
		context.ignore.labels.add(this.label.name);
		if (this.body.hasEffects(context)) return true;
		context.ignore.labels.delete(this.label.name);
		context.breakFlow = breakFlow;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		const breakFlow = context.breakFlow;
		this.label.include(context);
		this.body.include(context, includeChildrenRecursively);
		context.breakFlow = breakFlow;
	}
}
