import Identifier from "./Identifier";
import { Node } from './shared/Node';

export default interface ImportNamespaceSpecifier extends Node {
  type: 'ImportNamespaceSpecifier';
  local: Identifier;
}
