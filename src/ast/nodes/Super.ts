import { ObjectPath } from '../utils/PathTracker';
import ThisVariable from '../variables/ThisVariable';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class Super extends NodeBase {
	type!: NodeType.tSuper;

	variable!: ThisVariable;

	bind(): void {
		this.variable = this.scope.findVariable('this') as ThisVariable;
	}

	deoptimizePath(path: ObjectPath): void {
		this.variable.deoptimizePath(path);
	}

	include(): void {
		if (!this.included) {
			this.included = true;
			this.context.includeVariableInModule(this.variable);
		}
	}
}
