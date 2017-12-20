import Identifier from "./Identifier";

export default interface ExportNamespaceSpecifier {
  type: 'ImportNamespaceSpecifier';
  local: Identifier;
}