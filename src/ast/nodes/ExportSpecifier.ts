import { Node } from './shared/Node';
import Identifier from './Identifier';
import * as NodeType from './NodeType';

export default interface ExportSpecifier extends Node {
	type: NodeType.tExportSpecifier;
	local: Identifier;
	exported: Identifier;
}
