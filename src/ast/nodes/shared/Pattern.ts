import { WritableEntity } from '../../Entity';
import { GenericNode, Node } from './Node';
import { ObjectPath } from '../../variables/VariableReassignmentTracker';
import ExecutionPathOptions from '../../ExecutionPathOptions';

export interface PatternNode extends WritableEntity, Node {}

export class GenericPatternNode extends GenericNode implements PatternNode {
	reassignPath (_path: ObjectPath, _options: ExecutionPathOptions) {}
}
