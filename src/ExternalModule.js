import { blank } from './utils/object';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

class ExternalDeclaration {
	constructor ( module, name ) {
		this.module = module;
		this.name = name;
		this.isExternal = true;
	}

	addAlias () {
		// noop
	}

	addReference ( reference ) {
		reference.declaration = this;

		if ( this.name === 'default' || this.name === '*' ) {
			this.module.suggestName( reference.name );
		}
	}

	render ( es6 ) {
		if ( this.name === '*' ) {
			return this.module.name;
		}

		if ( this.name === 'default' ) {
			return !es6 && this.module.exportsNames ?
				`${this.module.name}__default` :
				this.module.name;
		}

		return es6 ? this.name : `${this.module.name}.${this.name}`;
	}

	use () {
		// noop?
	}
}

export default class ExternalModule {
	constructor ( id ) {
		this.id = id;
		this.name = makeLegalIdentifier( id );

		this.nameSuggestions = blank();
		this.mostCommonSuggestion = 0;

		this.isExternal = true;
		this.declarations = blank();

		this.exportsNames = false;
	}

	suggestName ( name ) {
		if ( !this.nameSuggestions[ name ] ) this.nameSuggestions[ name ] = 0;
		this.nameSuggestions[ name ] += 1;

		if ( this.nameSuggestions[ name ] > this.mostCommonSuggestion ) {
			this.mostCommonSuggestion = this.nameSuggestions[ name ];
			this.name = name;
		}
	}

	traceExport ( name ) {
		if ( name !== 'default' && name !== '*' ) {
			this.exportsNames = true;
		}

		return this.declarations[ name ] || (
			this.declarations[ name ] = new ExternalDeclaration( this, name )
		);
	}
}
