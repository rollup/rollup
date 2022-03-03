import type { HasEffectsContext } from '../ExecutionContext';
import { EMPTY_PATH, type ObjectPath } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import type Property from './Property';
import type RestElement from './RestElement';
import type { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';

export default class ObjectPattern extends NodeBase implements PatternNode {
	declare properties: readonly (Property | RestElement)[];
	declare type: NodeType.tObjectPattern;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
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

	markDeclarationReached(): void {
		for (const property of this.properties) {
			property.markDeclarationReached();
		}
	}
}
