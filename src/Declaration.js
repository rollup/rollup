import { blank, forOwn, keys } from './utils/object.js';
import { reservedWords } from './utils/identifierHelpers.js';
import { UNKNOWN_ASSIGNMENT } from './ast/values';

export class SyntheticNamespaceDeclaration {
	constructor ( module ) {
		this.isNamespace = true;
		this.module = module;
		this.name = module.basename();

		this.needsNamespaceBlock = false;

		this.originals = blank();
		module.getExports().concat( module.getReexports() ).forEach( name => {
			this.originals[ name ] = module.traceExport( name );
		} );
	}

	addReference ( node ) {
		this.name = node.name;
	}

	assignExpression () {
		// This should probably not happen, but not defining this might prevent a more meaningful error message
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN_ASSIGNMENT );
	}

	getName () {
		return this.name;
	}

	includeDeclaration () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		this.needsNamespaceBlock = true;
		forOwn( this.originals, original => original.includeDeclaration() );
		return true;
	}

	renderBlock ( es, legacy, indentString ) {
		const members = keys( this.originals ).map( name => {
			const original = this.originals[ name ];

			if ( original.isReassigned && !legacy ) {
				return `${indentString}get ${name} () { return ${original.getName( es )}; }`;
			}

			if ( legacy && ~reservedWords.indexOf( name ) ) name = `'${name}'`;
			return `${indentString}${name}: ${original.getName( es )}`;
		} );

		const callee = legacy ? `(Object.freeze || Object)` : `Object.freeze`;
		return `${this.module.bundle.varOrConst} ${this.getName( es )} = ${callee}({\n${members.join( ',\n' )}\n});\n\n`;
	}
}

export class ExternalDeclaration {
	constructor ( module, name ) {
		this.module = module;
		this.name = name;
		this.safeName = null;
		this.isExternal = true;
		this.isNamespace = name === '*';
	}

	addReference ( reference ) {
		reference.declaration = this;

		if ( this.name === 'default' || this.name === '*' ) {
			this.module.suggestName( reference.name );
		}
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN_ASSIGNMENT );
	}

	getName ( es ) {
		if ( this.name === '*' ) {
			return this.module.name;
		}

		if ( this.name === 'default' ) {
			return this.module.exportsNamespace || ( !es && this.module.exportsNames ) ?
				`${this.module.name}__default` :
				this.module.name;
		}

		return es ? this.safeName : `${this.module.name}.${this.name}`;
	}

	includeDeclaration () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		this.module.used = true;
		return true;
	}

	setSafeName ( name ) {
		this.safeName = name;
	}
}
