import { ExecutionPathOptions } from '../ExecutionPathOptions';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase, StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	body!: StatementNode;
	label!: Identifier;
	type!: NodeType.tLabeledStatement;

	hasEffects(options: ExecutionPathOptions) {
		return this.body.hasEffects(options.setIgnoreLabel(this.label.name).setIgnoreBreakStatements());
	}
}
