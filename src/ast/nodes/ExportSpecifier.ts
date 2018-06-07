import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { Node } from './shared/Node';

export default interface ExportSpecifier extends Node {
	type: NodeType.tExportSpecifier;
	local: Identifier;
	exported: Identifier;
}
