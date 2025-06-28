import type { ast } from '../../rollup/types';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class EmptyStatement extends NodeBase<ast.EmptyStatement> {
	parent!: nodes.EmptyStatementParent;
	type!: NodeType.tEmptyStatement;

	hasEffects(): boolean {
		return false;
	}
}

EmptyStatement.prototype.includeNode = onlyIncludeSelf;
