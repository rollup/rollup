import Identifier from "./Identifier";
import { Node } from './shared/Node';
import { NodeType } from './index';

export default interface ImportDefaultSpecifier extends Node {
  type: NodeType.ImportDefaultSpecifier;
  local: Identifier;
}
