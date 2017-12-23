import Identifier from "./Identifier";
import Node from '../Node';

export default interface ImportDefaultSpecifier extends Node {
  type: 'ImportDefaultSpecifier';
  local: Identifier;
}
