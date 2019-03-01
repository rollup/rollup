import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath, UNKNOWN_EXPRESSION, UNKNOWN_KEY } from '../values';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class RestElement extends NodeBase implements PatternNode {
	argument: PatternNode;
	type: NodeType.tRestElement;

	private declarationInit: ExpressionEntity | null = null;

	addExportedVariables(variables: Variable[]): void {
		this.argument.addExportedVariables(variables);
	}

	bind() {
		super.bind();
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UNKNOWN_KEY, UNKNOWN_KEY]);
		}
	}

	declare(kind: string, init: ExpressionEntity) {
		this.argument.declare(kind, UNKNOWN_EXPRESSION);
		this.declarationInit = init;
	}

	deoptimizePath(path: ObjectPath) {
		path.length === 0 && this.argument.deoptimizePath(EMPTY_PATH);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options);
	}
}
