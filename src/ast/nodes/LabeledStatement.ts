import { ExecutionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase, StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	body!: StatementNode;
	label!: Identifier;
	type!: NodeType.tLabeledStatement;

	hasEffects(context: ExecutionContext) {
		const {
			ignore: { breakStatements }
		} = context;
		context.ignore.breakStatements = true;
		context.ignore.labels.add(this.label.name);
		if (this.body.hasEffects(context)) return true;
		context.ignore.breakStatements = breakStatements;
		context.ignore.labels.delete(this.label.name);
		return false;
	}
}
