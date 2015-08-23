import Scope from './Scope';
import { blank, forOwn, keys } from './utils/object';

// A JSONModule represents a static JSON object that can be rolled-up.
export default class JSONModule extends Scope {
	constructor ( name, data ) {
		// Implement Identifier interface.
		// Doing so allows a JSONModule to be referenced.
		this.originalName = this.name = name;

		this.isIncluded = false;
		this.namesToInclude = {};

		this.data = data;

		forOwn( this.data, ( value, key ) => {
			if ( value && typeof value === 'object' ) {
				this.bind( key, new JSONModule( key, value ) );
			} else {
				this.define( key );
			}
		});
	}

	// Data has no dependencies
	consolidateDependencies () {
		return {
			strongDependencies: blank(),
			weakDependencies: blank()
		};
	}

	// Mark a name within the module, or the value of the module itself.
	mark ( name ) {
		if ( !name ) {
			// `Statement.mark`
      // The names that may be accessed within the module is unknown.
      // We must include all of it from this point.
			keys( this.data ).forEach( key => this.mark( key ) );
			this.isIncluded = true;
      return;
		}

		this.namesToInclude[ name ] = true;
	}

	render () {
    const [ code, data ] = this.renderData();

		return new MagicString( `const ${this.name} = ${data};` );
	}

	renderData () {
		if ( !this.isIncluded ) return [];

		const codes = [];

		let tuples = keys( this.namesToInclude ).map( name => {
      if (  ) {

      }


			const [ code, data ] = sub.renderData();

			codes.push( code );

			return `${str(name)} = ${data}`;
		});

    return [ codes,  ];
	}
}
