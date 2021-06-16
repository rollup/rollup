import { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH, ObjectPath } from '../utils/PathTracker';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import Property from './Property';
import RestElement from './RestElement';
import { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class ObjectPattern extends NodeBase implements PatternNode {
	properties!: (Property | RestElement)[];
	type!: NodeType.tObjectPattern;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: Map<Variable, string[]>
	): void {
		for (const property of this.properties) {
			if (property.type === NodeType.Property) {
				(property.value as unknown as PatternNode).addExportedVariables(
					variables,
					exportNamesByVariable
				);
			} else {
				property.argument.addExportedVariables(variables, exportNamesByVariable);
			}
		}
	}

	declare(kind: string, init: ExpressionEntity): LocalVariable[] {
		const variables: LocalVariable[] = [];
		for (const property of this.properties) {
			variables.push(...property.declare(kind, init));
		}
		return variables;
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) {
			for (const property of this.properties) {
				property.deoptimizePath(path);
			}
		}
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length > 0) return true;
		for (const property of this.properties) {
			if (property.hasEffectsWhenAssignedAtPath(EMPTY_PATH, context)) return true;
		}
		return false;
	}
}
