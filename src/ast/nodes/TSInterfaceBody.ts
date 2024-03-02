import type * as NodeType from './NodeType';
import { NodeBase, type StatementNode } from './shared/Node';

export default class TSInterfaceBody extends NodeBase {
	declare body: readonly StatementNode[];
	declare type: NodeType.tTSInterfaceBody;
}
