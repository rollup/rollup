
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

		const ref = this.exports.reference;

		// Override reference.
		this.exports.reference = name => {
			if ( !this.exports.defines( name ) ) {
				this.exports.define({
					originalName: name,
					name,

					module: this
				});
			}

			return ref.call( this.exports, name );
		};
	}

	findDefiningStatement () {
		return null;
	}
}
