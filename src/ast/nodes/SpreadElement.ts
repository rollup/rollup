import Expression from "./Expression";

export default interface SpreadElement extends Node {
  type: 'SpreadElement';
  argument: Expression;
}