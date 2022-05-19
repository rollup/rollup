import type { ObjectPath } from '../utils/PathTracker';
import type ThisVariable from '../variables/ThisVariable';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class Super extends NodeBase {
	declare type: NodeType.tSuper;
	declare variable: ThisVariable;

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
