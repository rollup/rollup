import LocalVariable from './LocalVariable';

export default class ExportDefaultVariable extends LocalVariable {
	constructor ( name, exportDefaultDeclaration ) {
		super( name, exportDefaultDeclaration, exportDefaultDeclaration.declaration );
		this.isDefault = true;
		this.hasId = !!exportDefaultDeclaration.declaration.id;
	}

	addReference ( reference ) {
		this.name = reference.name;
		if ( this._original ) {
			this._original.addReference( reference );
		}
	}

	getName ( es ) {
		if ( this._original && !this._original.isReassigned ) {
			return this._original.getName( es );
		}
		return this.name;
	}

	getOriginalVariableName ( es ) {
		return this._original && this._original.getName( es );
	}

	includeVariable () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		this.declarations.forEach( declaration => declaration.includeDefaultExport() );
		return true;
	}

	setOriginalVariable ( original ) {
		this._original = original;
	}
}
