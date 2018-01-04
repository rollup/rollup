import Identifier from "./Identifier";
import { Node } from './shared/Node';

export default interface ImportDefaultSpecifier extends Node {
  type: 'ImportDefaultSpecifier';
  local: Identifier;
}
