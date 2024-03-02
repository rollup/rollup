import type * as NodeType from './NodeType';
import type TSInterfaceBody from './TSInterfaceBody';
import { NodeBase } from './shared/Node';

export default class TSInterfaceDeclaration extends NodeBase {
	declare body: TSInterfaceBody;
	declare type: NodeType.tTSInterfaceDeclaration;
}
