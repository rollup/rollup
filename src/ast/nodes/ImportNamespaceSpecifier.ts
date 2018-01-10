import Identifier from "./Identifier";
import { Node } from './shared/Node';
import { NodeType } from './index';

export default interface ImportNamespaceSpecifier extends Node {
  type: NodeType.ImportNamespaceSpecifier;
  local: Identifier;
}
