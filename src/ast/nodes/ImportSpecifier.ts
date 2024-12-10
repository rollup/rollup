import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class ImportSpecifier extends NodeBase {
	declare imported: Identifier | Literal<string>;
	declare local: Identifier;
	declare type: NodeType.tImportSpecifier;

	protected applyDeoptimizations() {}
}

ImportSpecifier.prototype.includeNode = onlyIncludeSelf;
