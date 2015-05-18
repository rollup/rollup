export default class ExternalModule {
	constructor ( id ) {
		this.id = id;
		this.name = null;

		this.isExternal = true;
		this.importedByBundle = [];

		this.canonicalNames = {};
		this.defaultExportName = null;
	}

	getCanonicalName ( name ) {
		if ( name === 'default' ) {
			return `${this.name}__default`; // TODO...
		}

		if ( name === '*' ) {
			return this.name;
		}

		// TODO this depends on the output format... works for CJS etc but not ES6
		return `${this.name}.${name}`;
	}

	rename ( name, replacement ) {
		this.canonicalNames[ name ] = replacement;
	}

	suggestDefaultName ( name ) {
		if ( !this.defaultExportName ) {
			this.defaultExportName = name;
		}
	}
}