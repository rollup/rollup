export default class ExternalModule {
	constructor ( id ) {
		this.id = id;
		this.name = null;

		this.isExternal = true;
		this.importedByBundle = [];

		this.canonicalNames = {};
		this.suggestedNames = {};

		this.needsDefault = false;
		this.needsNamed = false;
	}

	getCanonicalName ( name ) {
		if ( name === 'default' ) {
			return this.needsNamed ? `${this.name}__default` : this.name;
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

	suggestName ( exportName, suggestion ) {
		if ( !this.suggestedNames[ exportName ] ) {
			this.suggestedNames[ exportName ] = suggestion;
		}
	}
}
