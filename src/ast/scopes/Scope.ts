import { toBase64 } from '../../utils/base64';
import { NEW_EXECUTION_PATH } from '../ExecutionPathOptions';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { EMPTY_PATH, UNKNOWN_EXPRESSION } from '../values';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ExternalVariable from '../variables/ExternalVariable';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import ThisVariable from '../variables/ThisVariable';
import Variable from '../variables/Variable';

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
			variable.reassignPath(EMPTY_PATH, NEW_EXECUTION_PATH);
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
		for (const key of Object.keys(this.variables)) {
			const declaration = this.variables[key];

			// we can disregard exports.foo etc
			if (declaration.exportName && declaration.isReassigned && !declaration.isId) continue;
			if (declaration.isDefault) continue;

			let name = declaration.getName(true);
			if (!names.has(name)) continue;

			name = declaration.name;
			let deshadowed,
				i = 1;
			do {
				deshadowed = `${name}$$${toBase64(i++)}`;
			} while (names.has(deshadowed));

			declaration.setSafeName(deshadowed);
		}

		for (const scope of children) scope.deshadow(names);
	}

	findLexicalBoundary(): Scope {
		return (<Scope>this.parent).findLexicalBoundary();
	}

	findVariable(name: string): Variable {
		return this.variables[name] || (this.parent && this.parent.findVariable(name));
	}
}
