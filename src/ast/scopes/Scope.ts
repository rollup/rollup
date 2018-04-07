import LocalVariable from '../variables/LocalVariable';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import { UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from '../nodes/Identifier';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import GlobalVariable from '../variables/GlobalVariable';
import ThisVariable from '../variables/ThisVariable';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import Variable from '../variables/Variable';
import { ExpressionEntity } from '../nodes/shared/Expression';
import ExternalVariable from '../variables/ExternalVariable';

export default class Scope {
	parent: Scope | void;
	variables: {
		this: ThisVariable | LocalVariable;
		default: ExportDefaultVariable;
		arguments: ArgumentsVariable;
		[name: string]: LocalVariable | GlobalVariable | ExternalVariable | ArgumentsVariable;
	};
	isModuleScope: boolean;
	children: Scope[];

	constructor(options: { parent?: Scope; isModuleScope?: boolean } = {}) {
		this.parent = options.parent;
		this.isModuleScope = !!options.isModuleScope;

		this.children = [];
		if (this.parent) this.parent.children.push(this);

		this.variables = Object.create(null);
	}

	/**
	 * @param identifier
	 * @param {Object} [options] - valid options are
	 *        {(Node|null)} init
	 *        {boolean} isHoisted
	 * @return {Variable}
	 */
	addDeclaration(
		identifier: Identifier,
		options: {
			init?: ExpressionEntity | null;
			isHoisted?: boolean;
		} = {
			init: null,
			isHoisted: false
		}
	) {
		const name = identifier.name;
		if (this.variables[name]) {
			const variable = <LocalVariable>this.variables[name];
			variable.addDeclaration(identifier);
			variable.reassignPath([], ExecutionPathOptions.create());
		} else {
			this.variables[name] = new LocalVariable(
				identifier.name,
				identifier,
				options.init || UNKNOWN_EXPRESSION
			);
		}
		return this.variables[name];
	}

	addExportDefaultDeclaration(
		name: string,
		exportDefaultDeclaration: ExportDefaultDeclaration
	): ExportDefaultVariable {
		this.variables.default = new ExportDefaultVariable(name, exportDefaultDeclaration);
		return this.variables.default;
	}

	addReturnExpression(expression: ExpressionEntity) {
		this.parent && this.parent.addReturnExpression(expression);
	}

	contains(name: string): boolean {
		return name in this.variables || (this.parent ? this.parent.contains(name) : false);
	}

	deshadow(names: Set<string>, children = this.children) {
		Object.keys(this.variables).forEach(key => {
			const declaration = this.variables[key];

			// we can disregard exports.foo etc
			if (declaration.exportName && declaration.isReassigned && !declaration.isId) return;

			if (declaration.isDefault) return;

			let name = declaration.getName(true);

			if (!names.has(name)) {
				return;
			}

			name = declaration.name;
			let deshadowed,
				i = 1;
			do {
				deshadowed = `${name}$$${i++}`;
			} while (names.has(deshadowed));

			declaration.setSafeName(deshadowed);
		});

		children.forEach(scope => scope.deshadow(names));
	}

	findLexicalBoundary(): Scope {
		return (<Scope>this.parent).findLexicalBoundary();
	}

	findVariable(name: string): Variable {
		return this.variables[name] || (this.parent && this.parent.findVariable(name));
	}
}
