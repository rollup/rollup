import type { AstContext } from '../../Module';
import { logRedeclarationError } from '../../utils/logs';
import type Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import type LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';
import type ParameterScope from './ParameterScope';

export default class CatchBodyScope extends ChildScope {
	constructor(
		readonly parent: ParameterScope,
		readonly context: AstContext
	) {
		super(parent, context);
	}

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind,
		// TODO Lukas what if this meets another existing variable?
		variable: LocalVariable | null
	): LocalVariable {
		if (kind === VariableKind.var) {
			const name = identifier.name;
			const existingVariable =
				this.hoistedVariables?.get(name) || (this.variables.get(name) as LocalVariable | undefined);
			if (existingVariable) {
				const existingKind = existingVariable.kind;
				if (
					existingKind === VariableKind.var ||
					(existingKind === VariableKind.parameter &&
						// If this is a destructured parameter, it is forbidden to redeclare
						existingVariable.declarations[0].parent.type === NodeType.CatchClause)
				) {
					existingVariable.addDeclaration(identifier, init);
					// We also need to add the "parameter" to the parent scopes as it is
					// hoisted. Technically, it is not the same variable, but then
					// deconflicting works as expected. We then need to remove the
					// declaration from the current scope as every declaration can only
					// have a single scope for deconflicting to work.
					this.parent.parent.addDeclaration(identifier, context, init, kind, existingVariable);
					this.addHoistedVariable(name, existingVariable);
					if (this.parent.variables.has(name)) {
						this.parent.variables.delete(name);
					}
					return existingVariable;
				}
				return context.error(logRedeclarationError(name), identifier.start);
			}
			// We only add parameters to parameter scopes
			const declaredVariable = this.parent.parent.addDeclaration(
				identifier,
				context,
				init,
				kind,
				variable
			);
			// Necessary to make sure the init is deoptimized for conditional declarations.
			// We cannot call deoptimizePath here.
			declaredVariable.markInitializersForDeoptimization();
			// We add the variable to this and all parent scopes to reliably detect conflicts
			this.addHoistedVariable(name, declaredVariable);
			return declaredVariable;
		}
		if (kind === VariableKind.function) {
			const name = identifier.name;
			const existingVariable =
				this.hoistedVariables?.get(name) || (this.variables.get(name) as LocalVariable | undefined);
			if (existingVariable) {
				context.error(logRedeclarationError(name), identifier.start);
			}
		}
		return super.addDeclaration(identifier, context, init, kind, variable);
	}
}
