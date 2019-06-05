import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath, UNKNOWN_EXPRESSION } from '../values';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ArrayPattern extends NodeBase implements PatternNode {
	elements!: (PatternNode | null)[];
	type!: NodeType.tArrayPattern;

	addExportedVariables(variables: Variable[]): void {
		for (const element of this.elements) {
			if (element !== null) {
				element.addExportedVariables(variables);
			}
		}
	}

	declare(kind: string, _init: ExpressionEntity) {
		const variables = [];
		for (const element of this.elements) {
			if (element !== null) {
				variables.push(...element.declare(kind, UNKNOWN_EXPRESSION));
			}
		}
		return variables;
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length === 0) {
			for (const element of this.elements) {
				if (element !== null) {
					element.deoptimizePath(path);
				}
			}
		}
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) return true;
		for (const element of this.elements) {
			if (element !== null && element.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options))
				return true;
		}
		return false;
	}
}
