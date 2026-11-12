import type { AstContext } from '../../Module';
import { logRedeclarationError } from '../../utils/logs';
import type Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type { VariableKind } from '../nodes/shared/VariableKinds';
import type { ObjectPath } from '../utils/PathTracker';
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
		destructuredInitPath: ObjectPath,
		kind: VariableKind
	): LocalVariable {
		if (kind === 'var') {
			const name = identifier.name;
			const parameter = this.parent.variables.get(name) as LocalVariable | undefined;
			if (isSimpleCatchParameter(parameter)) {
				// Annex B: a var redeclaring a simple catch parameter is hoisted
				// without assignment while its initializer assigns the parameter. As
				// the rendered declaration also declares the hoisted variable, the
				// parameter renders with the hoisted variable's name, unless that
				// variable is rendered as an exports member, in which case the
				// declaration becomes an assignment.
				const declaredVariable = this.parent.parent.addDeclaration(
					identifier,
					context,
					UNDEFINED_EXPRESSION,
					destructuredInitPath,
					kind
				);
				declaredVariable.markInitializersForDeoptimization();
				parameter.renderLikeHoisted(declaredVariable.getHoistedVariable() ?? declaredVariable);
				if (!this.isShadowedByInnerCatchParameter(identifier, name)) {
					parameter.addDeclaration(identifier, init);
				}
				return parameter;
			}
			const existingVariable =
				this.hoistedVariables?.get(name) || (this.variables.get(name) as LocalVariable | undefined);
			if (existingVariable) {
				if (existingVariable.kind === 'var') {
					existingVariable.addDeclaration(identifier, init);
					return existingVariable;
				}
				if (existingVariable.kind === 'parameter' && existingVariable !== parameter) {
					return this.parent.parent.addDeclaration(
						identifier,
						context,
						init,
						destructuredInitPath,
						kind
					);
				}
				return context.error(logRedeclarationError(name), identifier.start);
			}
			// We only add parameters to parameter scopes
			const declaredVariable = this.parent.parent.addDeclaration(
				identifier,
				context,
				init,
				destructuredInitPath,
				kind
			);
			// Necessary to make sure the init is deoptimized for conditional declarations.
			// We cannot call deoptimizePath here.
			declaredVariable.markInitializersForDeoptimization();
			// We add the variable to this and all parent scopes to reliably detect conflicts
			this.addHoistedVariable(name, declaredVariable);
			return declaredVariable;
		}
		return super.addDeclaration(identifier, context, init, destructuredInitPath, kind);
	}

	private isShadowedByInnerCatchParameter(identifier: Identifier, name: string): boolean {
		let scope: ChildScope = identifier.scope;
		while (scope !== this) {
			if (scope instanceof CatchBodyScope) {
				const parameter = (scope.parent as ParameterScope).variables.get(name) as
					LocalVariable | undefined;
				if (isSimpleCatchParameter(parameter)) return true;
			}
			scope = scope.parent as ChildScope;
		}
		return false;
	}
}

function isSimpleCatchParameter(variable: LocalVariable | undefined): variable is LocalVariable {
	return (
		variable?.kind === 'parameter' &&
		// If this is a destructured parameter, it is forbidden to redeclare
		variable.declarations[0].parent.type === NodeType.CatchClause
	);
}
