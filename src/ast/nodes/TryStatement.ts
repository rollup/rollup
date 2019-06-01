import { ExecutionPathOptions } from '../ExecutionPathOptions';
import BlockStatement from './BlockStatement';
import CatchClause from './CatchClause';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class TryStatement extends StatementBase {
	block!: BlockStatement;
	finalizer!: BlockStatement | null;
	handler!: CatchClause | null;
	type!: NodeType.tTryStatement;

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.block.body.length > 0 ||
			(this.handler !== null && this.handler.hasEffects(options)) ||
			(this.finalizer !== null && this.finalizer.hasEffects(options))
		);
	}

	include(includeAllChildrenRecursively: boolean) {
		if (!this.included) {
			this.included = true;
			this.block.include(true);
		}
		if (this.handler !== null) {
			this.handler.include(includeAllChildrenRecursively);
		}
		if (this.finalizer !== null) {
			this.finalizer.include(includeAllChildrenRecursively);
		}
	}
}
