import { ExecutionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase, StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	body!: StatementNode;
	label!: Identifier;
	type!: NodeType.tLabeledStatement;

	hasEffects(context: ExecutionContext) {
		const { ignoreBreakStatements } = context;
		context.ignoreBreakStatements = true;
		context.ignoredLabels.add(this.label.name);
		if (this.body.hasEffects(context)) return true;
		context.ignoreBreakStatements = ignoreBreakStatements;
		context.ignoredLabels.delete(this.label.name);
		return false;
	}
}
