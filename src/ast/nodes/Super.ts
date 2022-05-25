import { NodeEvent } from '../NodeEvents';
import type { ObjectPath } from '../utils/PathTracker';
import { PathTracker } from '../utils/PathTracker';
import Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';

export default class Super extends NodeBase {
	declare type: NodeType.tSuper;
	declare variable: Variable;

	bind(): void {
		this.variable = this.scope.findVariable('this');
	}

	deoptimizePath(path: ObjectPath): void {
		this.variable.deoptimizePath(path);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	) {
		this.variable.deoptimizeThisOnEventAtPath(event, path, thisParameter, recursionTracker);
	}

	include(): void {
		if (!this.included) {
			this.included = true;
			this.context.includeVariableInModule(this.variable);
		}
	}
}
