import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportSpecifier extends NodeBase {
	declare imported: Identifier;
	declare local: Identifier;
	declare type: NodeType.tImportSpecifier;
}
