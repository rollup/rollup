import Identifier from "./Identifier";
import { NodeBase } from './shared/Node';
import { NodeType } from './index';
import { includeInBundle } from "./ImportSpecifier";

export default class ImportDefaultSpecifier extends NodeBase {
  type: NodeType.ImportDefaultSpecifier;
  local: Identifier;

	includeInBundle () {
		return includeInBundle(this);
	}
}
