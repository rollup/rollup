import Identifier from './Identifier';
import { Node } from './shared/Node';
import * as NodeType from './NodeType';

export default interface ImportSpecifier extends Node {
	type: NodeType.tImportSpecifier;
	local: Identifier;
	imported: Identifier;
}
