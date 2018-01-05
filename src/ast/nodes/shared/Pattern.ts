import { WritableEntity } from '../../Entity';
import { BasicNode, Node } from './Node';
import { ObjectPath } from '../../variables/VariableReassignmentTracker';
import ExecutionPathOptions from '../../ExecutionPathOptions';

export interface PatternNode extends WritableEntity, Node {}

export class BasicPatternNode extends BasicNode implements PatternNode {
	reassignPath (_path: ObjectPath, _options: ExecutionPathOptions) {}
}
