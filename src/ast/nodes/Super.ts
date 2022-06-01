import { NodeInteraction } from '../NodeInteractions';
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

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	) {
		this.variable.deoptimizeThisOnInteractionAtPath(
			interaction,
			path,
			thisParameter,
			recursionTracker
		);
	}

	include(): void {
		if (!this.included) {
			this.included = true;
			this.context.includeVariableInModule(this.variable);
		}
	}
}
