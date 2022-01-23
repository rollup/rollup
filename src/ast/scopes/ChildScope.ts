import { InternalModuleFormat } from '../../rollup/types';
import { getSafeName } from '../../utils/safeName';
import ImportExpression from '../nodes/ImportExpression';
import { ExpressionEntity } from '../nodes/shared/Expression';
import Variable from '../variables/Variable';
import Scope from './Scope';

export default class ChildScope extends Scope {
	accessedOutsideVariables = new Map<string, Variable>();
	parent: Scope;
	private declare accessedDynamicImports?: Set<ImportExpression>;

	constructor(parent: Scope) {
		super();
		this.parent = parent;
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
		globals: string[],
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
		exportNamesByVariable: ReadonlyMap<Variable, string[]>,
		accessedGlobalsByScope: ReadonlyMap<ChildScope, Set<string>>
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
		exportNamesByVariable: ReadonlyMap<Variable, string[]>,
		accessedGlobalsByScope: ReadonlyMap<ChildScope, Set<string>>
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
				variable.setRenderNames(null, getSafeName(name, usedNames));
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
