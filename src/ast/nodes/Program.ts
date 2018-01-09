import { Node } from './shared/Node';
import { StatementNode } from './shared/Statement';
import { NodeType } from './index';

export default interface Program extends Node {
  type: NodeType.Program;
  body: StatementNode[];
}
