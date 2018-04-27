import Identifier from './Identifier';
import { Node } from './shared/Node';
import * as NodeType from './NodeType';

export default interface ImportDefaultSpecifier extends Node {
	type: NodeType.tImportDefaultSpecifier;
	local: Identifier;
}
