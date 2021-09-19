import { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath } from '../utils/PathTracker';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ArrayPattern extends NodeBase implements PatternNode {
	declare elements: (PatternNode | null)[];
	declare type: NodeType.tArrayPattern;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: Map<Variable, string[]>
	): void {
		for (const element of this.elements) {
			if (element !== null) {
				element.addExportedVariables(variables, exportNamesByVariable);
			}
		}
	}

	declare(kind: string): LocalVariable[] {
		const variables: LocalVariable[] = [];
		for (const element of this.elements) {
			if (element !== null) {
				variables.push(...element.declare(kind, UNKNOWN_EXPRESSION));
			}
		}
		return variables;
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) {
			for (const element of this.elements) {
				if (element !== null) {
					element.deoptimizePath(path);
				}
			}
		}
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length > 0) return true;
		for (const element of this.elements) {
			if (element !== null && element.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context))
				return true;
		}
		return false;
	}

	markDeclarationReached(): void {
		for (const element of this.elements) {
			if (element !== null) {
				element.markDeclarationReached();
			}
		}
	}
}
