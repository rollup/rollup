import Identifier from "./Identifier";

export default interface ImportSpecifier extends Node {
  type: 'ImportSpecifier';
  local: Identifier;
  imported: Identifier;
}
