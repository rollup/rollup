import { WritableEntity } from '../../Entity';
import { NodeBase, Node } from './Node';
import { ObjectPath } from '../../variables/VariableReassignmentTracker';
import ExecutionPathOptions from '../../ExecutionPathOptions';

export interface PatternNode extends WritableEntity, Node {}

export class GenericPatternNode extends NodeBase implements PatternNode {
	hasEffectsWhenAssignedAtPath (_path: ObjectPath, _options: ExecutionPathOptions) {
		return true;
	}

	reassignPath (_path: ObjectPath, _options: ExecutionPathOptions) {}
}
