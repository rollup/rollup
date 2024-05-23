import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import type TSNumberKeyword from './TSNumberKeyword';
import { NodeBase } from './shared/Node';

export default class TSTypeAliasDeclaration extends NodeBase {
	id!: Identifier;
	type!: NodeType.tTSTypeAliasDeclaration;
	typeAnnotation!: TSNumberKeyword;
	declare!: boolean;
}
