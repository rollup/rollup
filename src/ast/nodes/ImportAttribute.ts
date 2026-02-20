import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportAttribute extends NodeBase {
	declare parent: nodes.ImportAttributeParent;
	declare key: Identifier | Literal<string>;
	declare type: NodeType.tImportAttribute;
	declare value: Literal<string>;
}
