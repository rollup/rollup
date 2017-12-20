import Node from '../Node';
import Statement from './shared/Statement';

export default interface Program extends Node {
  type: 'Program';
  body: Statement[];
}