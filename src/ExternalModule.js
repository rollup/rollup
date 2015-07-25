import { blank } from './utils/object';

export default class ExternalModule {
	constructor ( id ) {
		this.id = id;
		this.name = null;

		this.isExternal = true;
		this.importedByBundle = [];

		this.canonicalNames = blank();
		this.suggestedNames = blank();

		this.needsDefault = false;

		// Invariant: needsNamed and needsAll are never both true at once.
		// Because an import with both a namespace and named import is invalid:
		//
		// 		import * as ns, { a } from '...'
		//
		this.needsNamed = false;
		this.needsAll = false;
	}

	findDefiningStatement () {
		return null;
	}

	getCanonicalName ( name, es6 ) {
		if ( name === 'default' ) {
			return this.needsNamed && !es6 ? `${this.name}__default` : this.name;
		}

		if ( name === '*' ) {
			return this.name; // TODO is this correct in ES6?
		}

		return es6 ? ( this.canonicalNames[ name ] || name ) : `${this.name}.${name}`;
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
