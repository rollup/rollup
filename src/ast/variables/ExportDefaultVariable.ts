import LocalVariable from './LocalVariable';

export default class ExportDefaultVariable extends LocalVariable {
	constructor ( name, exportDefaultDeclaration ) {
		super( name, exportDefaultDeclaration, exportDefaultDeclaration.declaration );
		this.isDefault = true;
		this.hasId = !!exportDefaultDeclaration.declaration.id;
	}

	addReference ( identifier ) {
		this.name = identifier.name;
		if ( this._original ) {
			this._original.addReference( identifier );
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
		if (!super.includeVariable()) {
			return false;
		}
		this.declarations.forEach( declaration => declaration.includeDefaultExport() );
		return true;
	}

	setOriginalVariable ( original ) {
		this._original = original;
	}
}
