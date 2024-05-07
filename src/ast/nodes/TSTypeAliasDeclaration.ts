import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import type TSNumberKeyword from './TSNumberKeyword';
import { NodeBase } from './shared/Node';

export default class TSTypeAliasDeclaration extends NodeBase {
	declare id: Identifier;
	declare type: NodeType.tTSTypeAliasDeclaration;
	declare typeAnnotation: TSNumberKeyword;
}
