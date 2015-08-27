
export default class ExternalModule {
	constructor ( { id, bundle } ) {
		this.id = id;

		// Implement `Identifier` interface.
		this.originalName = id;
		this.name = id;
		this.module = this;

		// Define the external module's name in the bundle scope.
		bundle.scope.define( id, this );

		this.isExternal = true;
		this.importedByBundle = [];

		// Invariant: needsNamed and needsAll are never both true at once.
		// Because an import with both a namespace and named import is invalid:
		//
		// 		import * as ns, { a } from '...'
		//
		this.needsNamed = false;
		this.needsAll = false;

		this.exports = bundle.scope.virtual( false );

		const { reference } = this.exports;

		// Override reference.
		this.exports.reference = name => {
			if ( name !== 'default' ) {
				this.needsNamed = true;
			}

			if ( !this.exports.defines( name ) ) {
				this.exports.define( name, {
					originalName: name,
					name,

					module: this
				});
			}

			return reference.call( this.exports, name );
		};
	}
}
