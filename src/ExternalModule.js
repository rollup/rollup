
export default class ExternalModule {
	constructor ( { id, bundle } ) {
		this.id = id;

		// Implement `Identifier` interface.
		this.originalName = id;
		this.name = id;
		this.module = this;

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

		bundle.scope.define( this.originalName, this );
		this.exports = bundle.scope.virtual();

		const { lookup, reference } = this.exports;

		// Override reference.
		this.exports.reference = name => {
			if ( name === 'default' ) {
				this.needsDefault = true;
				return bundle.scope.reference( this.originalName );
			}

			if ( !this.exports.defines( name ) ) {
				this.needsNamed = true;

				this.exports.define( name, {
					originalName: name,
					name,

					module: this
				});
			}

			return reference.call( this.exports, name );
		};

		// Override lookup.
		this.exports.lookup = name => {
			if ( name === 'default' ) {
				return this;
			}

			return lookup.call( this.exports, name );
		};
	}
}
