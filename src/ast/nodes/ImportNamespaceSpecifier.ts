import Identifier from "./Identifier";
import { NodeBase } from './shared/Node';
import { NodeType } from './index';
import { includeInBundle } from "./ImportSpecifier";

export default class ImportNamespaceSpecifier extends NodeBase {
  type: NodeType.ImportNamespaceSpecifier;
  local: Identifier;

	includeInBundle () {
		return includeInBundle(this);
	}
}
