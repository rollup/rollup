import CallOptions from '../CallOptions';
import { ExecutionContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath } from '../values';
import MethodDefinition from './MethodDefinition';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ClassBody extends NodeBase {
	body!: MethodDefinition[];
	type!: NodeType.tClassBody;

	private classConstructor!: MethodDefinition | null;

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: ExecutionContext
	) {
		if (path.length > 0) return true;
		return (
			this.classConstructor !== null &&
			this.classConstructor.hasEffectsWhenCalledAtPath(EMPTY_PATH, callOptions, context)
		);
	}

	initialise() {
		for (const method of this.body) {
			if (method.kind === 'constructor') {
				this.classConstructor = method;
				return;
			}
		}
		this.classConstructor = null;
	}
}
