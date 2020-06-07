import { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath, UnknownKey } from '../utils/PathTracker';
import { UNKNOWN_EXPRESSION } from '../values';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class RestElement extends NodeBase implements PatternNode {
	argument!: PatternNode;
	type!: NodeType.tRestElement;

	private declarationInit: ExpressionEntity | null = null;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: Map<Variable, string[]>
	): void {
		this.argument.addExportedVariables(variables, exportNamesByVariable);
	}

	bind() {
		super.bind();
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UnknownKey, UnknownKey]);
		}
	}

	declare(kind: string, init: ExpressionEntity) {
		this.declarationInit = init;
		return this.argument.declare(kind, UNKNOWN_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath) {
		path.length === 0 && this.argument.deoptimizePath(EMPTY_PATH);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context);
	}
}
