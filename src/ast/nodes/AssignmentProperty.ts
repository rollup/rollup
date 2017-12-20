import Pattern from "./Pattern";
import Property from "./Property";

export default interface AssignmentProperty extends Property {
  type: 'Property';
  value: Pattern;
  kind: 'init';
  method: false;
}