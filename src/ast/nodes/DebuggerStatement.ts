import type { ast } from '../../rollup/types';
import type { DebuggerStatementParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class DebuggerStatement extends NodeBase<ast.DebuggerStatement> {
	parent!: DebuggerStatementParent;
	type!: NodeType.tDebuggerStatement;

	hasEffects(): boolean {
		return true;
	}
}
