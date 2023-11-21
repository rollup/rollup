import type { AstContext } from '../../Module';
import { logRedeclarationError } from '../../utils/logs';
import type Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import { UNDEFINED_EXPRESSION } from '../values';
import type LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';
import type ParameterScope from './ParameterScope';

export default class CatchBodyScope extends ChildScope {
	constructor(readonly parent: ParameterScope) {
		super(parent, parent.context);
	}

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind
	): LocalVariable {
		if (kind === VariableKind.var) {
			const name = identifier.name;
			const existingVariable =
				this.hoistedVariables?.get(name) || (this.variables.get(name) as LocalVariable | undefined);
			if (existingVariable) {
				const existingKind = existingVariable.kind;
				if (
					existingKind === VariableKind.parameter &&
					// If this is a destructured parameter, it is forbidden to redeclare
					existingVariable.declarations[0].parent.type === NodeType.CatchClause
				) {
					// If this is a var with the same name as the catch scope parameter,
					// the assignment actually goes to the parameter and the var is
					// hoisted without assignment. Locally, it is shadowed by the
					// parameter
					const declaredVariable = this.parent.parent.addDeclaration(
						identifier,
						context,
						UNDEFINED_EXPRESSION,
						kind
					);
					// To avoid the need to rewrite the declaration, we link the variable
					// names. If we ever implement a logic that splits initialization and
					// assignment for hoisted vars, the "renderLikeHoisted" logic can be
					// removed again.
					// We do not need to check whether there already is a linked
					// variable because then declaredVariable would be that linked
					// variable.
					existingVariable.renderLikeHoisted(declaredVariable);
					this.addHoistedVariable(name, declaredVariable);
					return declaredVariable;
				}
				if (existingKind === VariableKind.var) {
					existingVariable.addDeclaration(identifier, init);
					return existingVariable;
				}
				return context.error(logRedeclarationError(name), identifier.start);
			}
			// We only add parameters to parameter scopes
			const declaredVariable = this.parent.parent.addDeclaration(identifier, context, init, kind);
			// Necessary to make sure the init is deoptimized for conditional declarations.
			// We cannot call deoptimizePath here.
			declaredVariable.markInitializersForDeoptimization();
			// We add the variable to this and all parent scopes to reliably detect conflicts
			this.addHoistedVariable(name, declaredVariable);
			return declaredVariable;
		}
		return super.addDeclaration(identifier, context, init, kind);
	}
}
