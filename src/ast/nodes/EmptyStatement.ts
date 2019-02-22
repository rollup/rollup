import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class EmptyStatement extends StatementBase {
	type: NodeType.tEmptyStatement;

	hasEffects(): boolean {
		return false;
	}
}
