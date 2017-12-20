import Pattern from "./Pattern";

export default interface AssignmentProperty {
  type: 'Property';
  value: Pattern;
  kind: 'init';
  method: false;
}