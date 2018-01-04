import { Node } from './shared/Node';
import { StatementNode } from './shared/Statement';

export default interface Program extends Node {
  type: 'Program';
  body: StatementNode[];
}
