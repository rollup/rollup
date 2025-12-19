import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteractionAssigned } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UnknownInteger, UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import type { ExpressionEntity } from './shared/Expression';
import { NodeBase, onlyIncludeSelf } from './shared/Node';
import type { DeclarationPatternNode, PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class ArrayPattern extends NodeBase implements DeclarationPatternNode {
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
					...(element as DeclarationPatternNode).declare(kind, includedPatternPath, init)
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
		interaction: NodeInteractionAssigned,
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
		for (const element of [...this.elements].reverse()) {
			if (element) {
				if (included && !element.included) {
					element.includeNode(context);
				}
				included =
					element.includeDestructuredIfNecessary(context, includedPatternPath, init) || included;
			}
		}
		if (!this.included && included) {
			this.includeNode(context);
		}
		return this.included;
	}

	render(code: MagicString, options: RenderOptions): void {
		let removedStart = this.start + 1;
		for (const element of this.elements) {
			if (!element) continue;
			if (element.included) {
				element.render(code, options);
				removedStart = element.end;
			} else {
				code.remove(removedStart, this.end - 1);
				break;
			}
		}
	}

	markDeclarationReached(): void {
		for (const element of this.elements) {
			(element as DeclarationPatternNode)?.markDeclarationReached();
		}
	}
}

ArrayPattern.prototype.includeNode = onlyIncludeSelf;

const getIncludedPatternPath = (destructuredInitPath: ObjectPath): ObjectPath =>
	destructuredInitPath.at(-1) === UnknownKey
		? destructuredInitPath
		: [...destructuredInitPath, UnknownInteger];
