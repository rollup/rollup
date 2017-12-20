import Expression from "./Expression";
import Node from '../Node';

export default interface SpreadElement extends Node {
  type: 'SpreadElement';
  argument: Expression;
}