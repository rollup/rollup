import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class ImportDefaultSpecifier extends NodeBase {
	declare local: Identifier;
	declare type: NodeType.tImportDefaultSpecifier;

	protected applyDeoptimizations() {}
}

ImportDefaultSpecifier.prototype.includeNode = onlyIncludeSelf;
