import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteractionAssigned } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class ArrayPattern extends NodeBase implements PatternNode {
	declare elements: (PatternNode | null)[];
	declare type: NodeType.tArrayPattern;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		for (const element of this.elements) {
			element?.addExportedVariables(variables, exportNamesByVariable);
		}
	}

	declare(kind: VariableKind): LocalVariable[] {
		const variables: LocalVariable[] = [];
		for (const element of this.elements) {
			if (element !== null) {
				variables.push(...element.declare(kind, UNKNOWN_EXPRESSION));
			}
		}
		return variables;
	}

	// Patterns can only be deoptimized at the empty path at the moment
	deoptimizePath(): void {
		for (const element of this.elements) {
			element?.deoptimizePath(EMPTY_PATH);
		}
	}

	// Patterns are only checked at the empty path at the moment
	hasEffectsOnInteractionAtPath(
		_path: ObjectPath,
		interaction: NodeInteractionAssigned,
		context: HasEffectsContext
	): boolean {
		for (const element of this.elements) {
			if (element?.hasEffectsOnInteractionAtPath(EMPTY_PATH, interaction, context)) return true;
		}
		return false;
	}

	markDeclarationReached(): void {
		for (const element of this.elements) {
			element?.markDeclarationReached();
		}
	}
}
