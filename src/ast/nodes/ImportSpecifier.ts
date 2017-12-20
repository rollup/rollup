import Identifier from "./Identifier";

export default interface ImportSpecifier {
  type: 'ImportSpecifier';
  local: Identifier;
  imported: Identifier;
}