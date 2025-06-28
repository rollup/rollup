import type { ast } from '../../rollup/types';
import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportAttribute extends NodeBase<ast.ImportAttribute> {
	parent!: nodes.ImportAttributeParent;
	key!: Identifier | Literal<string>;
	type!: NodeType.tImportAttribute;
	value!: Literal<string>;
}
