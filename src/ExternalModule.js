
export default class ExternalModule {
	constructor ( { id, bundle } ) {
		this.id = id;
		this.name = id;

		this.isExternal = true;
		this.importedByBundle = [];

		this.needsDefault = false;

		// Invariant: needsNamed and needsAll are never both true at once.
		// Because an import with both a namespace and named import is invalid:
		//
		// 		import * as ns, { a } from '...'
		//
		this.needsNamed = false;
		this.needsAll = false;

		this.exports = bundle.scope.virtual();
	}

	findDefiningStatement () {
		return null;
	}

	suggestName ( exportName, suggestion ) {
		const id = this.exports.lookup( exportName );

		if ( id.name === id.originalName ) {
			id.name = suggestion;
		}
	}
}
