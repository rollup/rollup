import LocalVariable from './LocalVariable';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import FunctionDeclaration from '../nodes/FunctionDeclaration';
import ClassDeclaration from '../nodes/ClassDeclaration';
import Identifier from '../nodes/Identifier';

export default class ExportDefaultVariable extends LocalVariable {
	isDefault: true;
	hasId: boolean;

	constructor (name: string, exportDefaultDeclaration: ExportDefaultDeclaration) {
		super(name, exportDefaultDeclaration, exportDefaultDeclaration.declaration);
		this.isDefault = true;
		this.hasId = !!(<FunctionDeclaration | ClassDeclaration>exportDefaultDeclaration.declaration).id;
	}

	addReference (identifier: Identifier) {
		this.name = identifier.name;
		if (this._original) {
			this._original.addReference(identifier);
		}
	}

	getName (es) {
		if (this._original && !this._original.isReassigned) {
			return this._original.getName(es);
		}
		return this.name;
	}

	getOriginalVariableName (es) {
		return this._original && this._original.getName(es);
	}

	includeVariable () {
		if (!super.includeVariable()) {
			return false;
		}
		this.declarations.forEach(declaration =>
			declaration.includeDefaultExport()
		);
		return true;
	}

	setOriginalVariable (original) {
		this._original = original;
	}
}
