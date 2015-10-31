import { blank } from './utils/object.js';
import makeLegalIdentifier from './utils/makeLegalIdentifier.js';
import { ExternalDeclaration } from './Declaration.js';

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
