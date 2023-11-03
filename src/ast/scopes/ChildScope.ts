import type { AstContext } from '../../Module';
import type { InternalModuleFormat } from '../../rollup/types';
import { getSafeName } from '../../utils/safeName';
import type ImportExpression from '../nodes/ImportExpression';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type Variable from '../variables/Variable';
import Scope from './Scope';

export default class ChildScope extends Scope {
	readonly accessedOutsideVariables = new Map<string, Variable>();
	parent: Scope;
	readonly context: AstContext;
	private declare accessedDynamicImports?: Set<ImportExpression>;

	constructor(parent: Scope, context: AstContext) {
		super();
		this.parent = parent;
		this.context = context;
		parent.children.push(this);
	}

	addAccessedDynamicImport(importExpression: ImportExpression): void {
		(this.accessedDynamicImports || (this.accessedDynamicImports = new Set())).add(
			importExpression
		);
		if (this.parent instanceof ChildScope) {
			this.parent.addAccessedDynamicImport(importExpression);
		}
	}

	addAccessedGlobals(
		globals: readonly string[],
		accessedGlobalsByScope: Map<ChildScope, Set<string>>
	): void {
		const accessedGlobals = accessedGlobalsByScope.get(this) || new Set();
		for (const name of globals) {
			accessedGlobals.add(name);
		}
		accessedGlobalsByScope.set(this, accessedGlobals);
		if (this.parent instanceof ChildScope) {
			this.parent.addAccessedGlobals(globals, accessedGlobalsByScope);
		}
	}

	addNamespaceMemberAccess(name: string, variable: Variable): void {
		this.accessedOutsideVariables.set(name, variable);
		(this.parent as ChildScope).addNamespaceMemberAccess(name, variable);
	}

	addReturnExpression(expression: ExpressionEntity): void {
		this.parent instanceof ChildScope && this.parent.addReturnExpression(expression);
	}

	addUsedOutsideNames(
		usedNames: Set<string>,
		format: InternalModuleFormat,
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>,
		accessedGlobalsByScope: ReadonlyMap<ChildScope, ReadonlySet<string>>
	): void {
		for (const variable of this.accessedOutsideVariables.values()) {
			if (variable.included) {
				usedNames.add(variable.getBaseVariableName());
				if (format === 'system' && exportNamesByVariable.has(variable)) {
					usedNames.add('exports');
				}
			}
		}
		const accessedGlobals = accessedGlobalsByScope.get(this);
		if (accessedGlobals) {
			for (const name of accessedGlobals) {
				usedNames.add(name);
			}
		}
	}

	contains(name: string): boolean {
		return this.variables.has(name) || this.parent.contains(name);
	}

	deconflict(
		format: InternalModuleFormat,
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>,
		accessedGlobalsByScope: ReadonlyMap<ChildScope, ReadonlySet<string>>
	): void {
		const usedNames = new Set<string>();
		this.addUsedOutsideNames(usedNames, format, exportNamesByVariable, accessedGlobalsByScope);
		if (this.accessedDynamicImports) {
			for (const importExpression of this.accessedDynamicImports) {
				if (importExpression.inlineNamespace) {
					usedNames.add(importExpression.inlineNamespace.getBaseVariableName());
				}
			}
		}
		for (const [name, variable] of this.variables) {
			if (variable.included || variable.alwaysRendered) {
				variable.setRenderNames(null, getSafeName(name, usedNames, variable.forbiddenNames));
			}
		}
		for (const scope of this.children) {
			scope.deconflict(format, exportNamesByVariable, accessedGlobalsByScope);
		}
	}

	findLexicalBoundary(): ChildScope {
		return (this.parent as ChildScope).findLexicalBoundary();
	}

	findVariable(name: string): Variable {
		const knownVariable = this.variables.get(name) || this.accessedOutsideVariables.get(name);
		if (knownVariable) {
			return knownVariable;
		}
		const variable = this.parent.findVariable(name);
		this.accessedOutsideVariables.set(name, variable);
		return variable;
	}
}
