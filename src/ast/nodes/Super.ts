import { ObjectPath } from '../utils/PathTracker';
import ThisVariable from '../variables/ThisVariable';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class Super extends NodeBase {
	type!: NodeType.tSuper;

	variable!: ThisVariable;
	private bound = false;

	bind() {
		if (this.bound) return;
		this.bound = true;
		this.variable = this.scope.findVariable('this') as ThisVariable;
	}

	deoptimizePath(path: ObjectPath) {
		this.bind();
		this.variable.deoptimizePath(path);
	}

	include() {
		if (!this.included) {
			this.included = true;
			this.context.includeVariableInModule(this.variable);
		}
	}
}
