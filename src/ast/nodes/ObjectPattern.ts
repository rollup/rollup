import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import { getCommaSeparatedNodesWithBoundaries } from '../../utils/renderHelpers';
import { treeshakeNode } from '../../utils/treeshakeNode';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteractionAssigned } from '../NodeInteractions';
import { EMPTY_PATH, type ObjectPath } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import type Property from './Property';
import type RestElement from './RestElement';
import type { ExpressionEntity } from './shared/Expression';
import { NodeBase } from './shared/Node';
import type { DeclarationPatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class ObjectPattern extends NodeBase implements DeclarationPatternNode {
	declare properties: readonly (Property | RestElement)[];
	declare type: NodeType.tObjectPattern;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		for (const property of this.properties) {
			if (property.type === NodeType.Property) {
				property.value.addExportedVariables(variables, exportNamesByVariable);
			} else {
				property.argument.addExportedVariables(variables, exportNamesByVariable);
			}
		}
	}

	declare(
		kind: VariableKind,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[] {
		const variables: LocalVariable[] = [];
		for (const property of this.properties) {
			variables.push(...property.declare(kind, destructuredInitPath, init));
		}
		return variables;
	}

	deoptimizeAssignment(destructuredInitPath: ObjectPath, init: ExpressionEntity): void {
		for (const property of this.properties) {
			property.deoptimizeAssignment(destructuredInitPath, init);
		}
	}

	deoptimizePath(path: ObjectPath): void {
		if (path.length === 0) {
			for (const property of this.properties) {
				property.deoptimizePath(path);
			}
		}
	}

	hasEffectsOnInteractionAtPath(
		// At the moment, this is only triggered for assignment left-hand sides,
		// where the path is empty
		_path: ObjectPath,
		interaction: NodeInteractionAssigned,
		context: HasEffectsContext
	): boolean {
		for (const property of this.properties) {
			if (property.hasEffectsOnInteractionAtPath(EMPTY_PATH, interaction, context)) return true;
		}
		return false;
	}

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		for (const property of this.properties) {
			if (property.hasEffectsWhenDestructuring(context, destructuredInitPath, init)) return true;
		}
		return false;
	}

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		let included = false;
		for (const property of this.properties) {
			included =
				property.includeDestructuredIfNecessary(context, destructuredInitPath, init) || included;
		}
		return (this.included ||= included);
	}

	markDeclarationReached(): void {
		for (const property of this.properties) {
			property.markDeclarationReached();
		}
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.properties.length > 0) {
			const separatedNodes = getCommaSeparatedNodesWithBoundaries(
				this.properties,
				code,
				this.start + 1,
				this.end - 1
			);
			let lastSeparatorPos: number | null = null;
			for (const { node, separator, start, end } of separatedNodes) {
				if (!node.included) {
					treeshakeNode(node, code, start, end);
					continue;
				}
				lastSeparatorPos = separator;
				node.render(code, options);
			}
			if (lastSeparatorPos) {
				code.remove(lastSeparatorPos, this.end - 1);
			}
		}
	}

	protected applyDeoptimizations() {}
}
