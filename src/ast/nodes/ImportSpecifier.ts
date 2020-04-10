import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportSpecifier extends NodeBase {
	imported!: Identifier;
	local!: Identifier;
	type!: NodeType.tImportSpecifier;
}
