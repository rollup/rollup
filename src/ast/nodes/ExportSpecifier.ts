import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ExportSpecifier extends NodeBase {
	declare exported: Identifier;
	declare local: Identifier;
	declare type: NodeType.tExportSpecifier;
}
