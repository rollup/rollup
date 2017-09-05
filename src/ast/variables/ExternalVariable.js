import Variable from './Variable';

export default class ExternalVariable extends Variable {
	constructor ( module, name ) {
		super( name );
		this.module = module;
		this.safeName = null;
		this.isExternal = true;
		this.isNamespace = name === '*';
	}

	addReference ( reference ) {
		if ( this.name === 'default' || this.name === '*' ) {
			this.module.suggestName( reference.name );
		}
	}

	getName ( es ) {
		if ( this.name === '*' ) {
			return this.module.name;
		}

		if ( this.name === 'default' ) {
			return this.module.exportsNamespace || ( !es && this.module.exportsNames ) ?
				`${this.module.name}__default` :
				this.module.name;
		}

		return es ? this.safeName : `${this.module.name}.${this.name}`;
	}

	includeDeclaration () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		this.module.used = true;
		return true;
	}

	setSafeName ( name ) {
		this.safeName = name;
	}
}
