import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import type TSInterfaceBody from './TSInterfaceBody';
import type TSInterfaceHeritage from './TSInterfaceHeritage';
import { NodeBase } from './shared/Node';

export default class TSInterfaceDeclaration extends NodeBase {
	declare id: Identifier;
	declare body: TSInterfaceBody;
	declare type: NodeType.tTSInterfaceDeclaration;
	declare extends: TSInterfaceHeritage[];
	declare declare: boolean;
}
