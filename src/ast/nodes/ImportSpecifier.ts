import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { Node } from './shared/Node';

export default interface ImportSpecifier extends Node {
	type: NodeType.tImportSpecifier;
	local: Identifier;
	imported: Identifier;
}
