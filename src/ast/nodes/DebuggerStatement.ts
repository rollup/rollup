import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class DebuggerStatement extends NodeBase {
	type!: NodeType.tDebuggerStatement;

	hasEffects(): boolean {
		return true;
	}
}

DebuggerStatement.prototype.includeNode = onlyIncludeSelf;
