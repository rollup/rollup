import { NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import MethodDefinition from './MethodDefinition';
import { NodeType } from './NodeType';
import { ObjectPath } from '../values';

export default class ClassBody extends NodeBase {
	type: NodeType.ClassBody;
	body: MethodDefinition[];

	private classConstructor: MethodDefinition | null;

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	) {
		if (path.length > 0) {
			return true;
		}
		return (
			this.classConstructor !== null &&
			this.classConstructor.hasEffectsWhenCalledAtPath([], callOptions, options)
		);
	}

	initialise() {
		this.included = false;
		for (const method of this.body) {
			if (method.kind === 'constructor') {
				this.classConstructor = method;
				return;
			}
		}
		this.classConstructor = null;
	}
}
