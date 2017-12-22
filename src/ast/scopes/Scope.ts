import { blank, keys } from '../../utils/object';
import LocalVariable from '../variables/LocalVariable';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import { UNDEFINED_ASSIGNMENT, UndefinedAssignment, UnknownAssignment } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from '../nodes/Identifier';
import Expression from '../nodes/Expression';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import Declaration from '../nodes/Declaration';
import GlobalVariable from '../variables/GlobalVariable';
import ExternalVariable from '../variables/ExternalVariable';
import ThisVariable from '../variables/ThisVariable';
import ArgumentsVariable from '../variables/ArgumentsVariable';

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

	constructor (options: { parent?: Scope, isModuleScope?: boolean } = {}) {
		this.parent = options.parent;
		this.isModuleScope = !!options.isModuleScope;

		this.children = [];
		if (this.parent) this.parent.children.push(this);

		this.variables = blank();
	}

	/**
	 * @param identifier
	 * @param {Object} [options] - valid options are
	 *        {(Node|null)} init
	 *        {boolean} isHoisted
	 * @return {Variable}
	 */
	addDeclaration (identifier: Identifier, options: {
		init?: Expression | Declaration | UnknownAssignment | UndefinedAssignment | null;
		isHoisted?: boolean;
	} = {
		init: null,
		isHoisted: false
	}) {
		const name = identifier.name;
		if (this.variables[name]) {
			const variable = <LocalVariable>this.variables[name];
			variable.addDeclaration(identifier);
			variable.reassignPath([], ExecutionPathOptions.create());
		} else {
			this.variables[name] = new LocalVariable(
				identifier.name,
				identifier,
				options.init || UNDEFINED_ASSIGNMENT
			);
		}
		return this.variables[name];
	}

	addExportDefaultDeclaration (name: string, exportDefaultDeclaration: ExportDefaultDeclaration): ExportDefaultVariable {
		this.variables.default = new ExportDefaultVariable(
			name,
			exportDefaultDeclaration
		);
		return this.variables.default;
	}

	addReturnExpression (expression: Expression | UndefinedAssignment) {
		this.parent && this.parent.addReturnExpression(expression);
	}

	contains (name: string): boolean {
		return (
			!!this.variables[name] ||
			(this.parent ? this.parent.contains(name) : false)
		);
	}

	deshadow (names: Set<string>) {
		keys(this.variables).forEach(key => {
			const declaration = this.variables[key];

			// we can disregard exports.foo etc
			if (declaration.exportName && declaration.isReassigned) return;

			const name = declaration.getName(true);
			let deshadowed = name;

			let i = 1;

			while (names.has(deshadowed)) {
				deshadowed = `${name}$$${i++}`;
			}

			declaration.name = deshadowed;
		});

		this.children.forEach(scope => scope.deshadow(names));
	}

	findLexicalBoundary (): Scope {
		return (<Scope>this.parent).findLexicalBoundary();
	}

	findVariable (name: string): ThisVariable | LocalVariable | ExportDefaultVariable | GlobalVariable | ExternalVariable | ArgumentsVariable {
		return (
			this.variables[name] || (this.parent && this.parent.findVariable(name))
		);
	}
}
