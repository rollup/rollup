import type { ast } from '../../rollup/types';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UnknownInteger, UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import type { ExpressionEntity } from './shared/Expression';
import { NodeBase, onlyIncludeSelf } from './shared/Node';
import type { DeclarationPatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class ArrayPattern
	extends NodeBase<ast.ArrayPattern>
	implements DeclarationPatternNode
{
	elements!: (nodes.DestructuringPattern | null)[];
	type!: NodeType.tArrayPattern;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		for (const element of this.elements) {
			element?.addExportedVariables(variables, exportNamesByVariable);
		}
	}

	declare(
		kind: VariableKind,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[] {
		const variables: LocalVariable[] = [];
		const includedPatternPath = getIncludedPatternPath(destructuredInitPath);
		for (const element of this.elements) {
			if (element !== null) {
				variables.push(
					...(element as nodes.BindingPattern).declare(kind, includedPatternPath, init)
				);
			}
		}
		return variables;
	}

	deoptimizeAssignment(destructuredInitPath: ObjectPath, init: ExpressionEntity): void {
		const includedPatternPath = getIncludedPatternPath(destructuredInitPath);
		for (const element of this.elements) {
			element?.deoptimizeAssignment(includedPatternPath, init);
		}
	}

	// Patterns can only be deoptimized at the empty path at the moment
	deoptimizePath(): void {
		for (const element of this.elements) {
			element?.deoptimizePath(EMPTY_PATH);
		}
	}

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		const includedPatternPath = getIncludedPatternPath(destructuredInitPath);
		for (const element of this.elements) {
			if (element?.hasEffectsWhenDestructuring(context, includedPatternPath, init)) {
				return true;
			}
		}
		return false;
	}

	// Patterns are only checked at the empty path at the moment
	hasEffectsOnInteractionAtPath(
		_path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		for (const element of this.elements) {
			if (element?.hasEffectsOnInteractionAtPath(EMPTY_PATH, interaction, context)) return true;
		}
		return false;
	}

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		let included = false;
		const includedPatternPath = getIncludedPatternPath(destructuredInitPath);
		for (const element of this.elements) {
			if (element) {
				element.included ||= included;
				included =
					element.includeDestructuredIfNecessary(context, includedPatternPath, init) || included;
			}
		}
		if (included) {
			// This is necessary so that if any pattern element is included, all are
			// included for proper deconflicting
			for (const element of this.elements) {
				if (element && !element.included) {
					element.included = true;
					element.includeDestructuredIfNecessary(context, includedPatternPath, init);
				}
			}
		}
		return (this.included ||= included);
	}

	markDeclarationReached(): void {
		for (const element of this.elements) {
			(element as nodes.BindingPattern | null)?.markDeclarationReached();
		}
	}
}

ArrayPattern.prototype.includeNode = onlyIncludeSelf;

const getIncludedPatternPath = (destructuredInitPath: ObjectPath): ObjectPath =>
	destructuredInitPath.at(-1) === UnknownKey
		? destructuredInitPath
		: [...destructuredInitPath, UnknownInteger];
