import isReference, { type NodeWithFieldDefinition } from 'is-reference';
import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createHasEffectsContext } from '../ExecutionContext';
import { NODE_INTERACTION_UNKNOWN_ACCESS } from '../NodeInteractions';
import type FunctionScope from '../scopes/FunctionScope';
import type { ObjectPath } from '../utils/PathTracker';
import { EMPTY_PATH, UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import * as NodeType from './NodeType';
import { type ExpressionEntity } from './shared/Expression';
import IdentifierBase from './shared/IdentifierBase';
import type { DeclarationPatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export type IdentifierWithVariable = Identifier & { variable: Variable };

export default class Identifier extends IdentifierBase implements DeclarationPatternNode {
	name!: string;
	type!: NodeType.tIdentifier;
	variable: Variable | null = null;

	addExportedVariables(
		variables: Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		if (exportNamesByVariable.has(this.variable!)) {
			variables.push(this.variable!);
		}
	}

	bind(): void {
		if (!this.variable && isReference(this, this.parent as NodeWithFieldDefinition)) {
			this.variable = this.scope.findVariable(this.name);
			this.variable.addReference(this);
			this.isVariableReference = true;
		}
	}

	declare(
		kind: VariableKind,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[] {
		let variable: LocalVariable;
		const { treeshake } = this.scope.context.options;
		if (kind === 'parameter') {
			variable = (this.scope as FunctionScope).addParameterDeclaration(this, destructuredInitPath);
		} else {
			variable = this.scope.addDeclaration(
				this,
				this.scope.context,
				init,
				destructuredInitPath,
				kind
			);
			if (kind === 'var' && treeshake && treeshake.correctVarValueBeforeDeclaration) {
				// Necessary to make sure the init is deoptimized. We cannot call deoptimizePath here.
				variable.markInitializersForDeoptimization();
			}
		}
		return [(this.variable = variable)];
	}

	deoptimizeAssignment(destructuredInitPath: ObjectPath, init: ExpressionEntity) {
		this.deoptimizePath(EMPTY_PATH);
		init.deoptimizePath([...destructuredInitPath, UnknownKey]);
	}

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		return (
			destructuredInitPath.length > 0 &&
			init.hasEffectsOnInteractionAtPath(
				destructuredInitPath,
				NODE_INTERACTION_UNKNOWN_ACCESS,
				context
			)
		);
	}

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		if (
			(this.included ||=
				destructuredInitPath.length > 0 &&
				!context.brokenFlow &&
				init.hasEffectsOnInteractionAtPath(
					destructuredInitPath,
					NODE_INTERACTION_UNKNOWN_ACCESS,
					createHasEffectsContext()
				))
		) {
			init.includePath(destructuredInitPath, context, false);
			return true;
		}
		return false;
	}

	markDeclarationReached(): void {
		this.variable!.initReached = true;
	}

	render(
		code: MagicString,
		{ snippets: { getPropertyAccess }, useOriginalName }: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent, isShorthandProperty }: NodeRenderOptions = BLANK
	): void {
		if (this.variable) {
			const name = this.variable.getName(getPropertyAccess, useOriginalName);

			if (name !== this.name) {
				code.overwrite(this.start, this.end, name, {
					contentOnly: true,
					storeName: true
				});
				if (isShorthandProperty) {
					code.prependRight(this.start, `${this.name}: `);
				}
			}
			// In strict mode, any variable named "eval" must be the actual "eval" function
			if (
				name === 'eval' &&
				renderedParentType === NodeType.CallExpression &&
				isCalleeOfRenderedParent
			) {
				code.appendRight(this.start, '0, ');
			}
		}
	}
}
