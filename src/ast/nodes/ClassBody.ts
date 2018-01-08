import { NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import MethodDefinition from './MethodDefinition';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class ClassBody extends NodeBase {
	type: 'ClassBody';
	body: MethodDefinition[];
	classConstructor: MethodDefinition | null;

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions) {
		if (path.length > 0) {
			return true;
		}
		return (
			this.classConstructor &&
			this.classConstructor.hasEffectsWhenCalledAtPath([], callOptions, options)
		);
	}

	initialiseNode () {
		this.classConstructor = this.body.find(
			method => method.kind === 'constructor'
		);
	}
}
