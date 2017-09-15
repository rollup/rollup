import Variable from './Variable';
import { blank, forOwn, keys } from '../../utils/object';
import { reservedWords } from '../../utils/identifierHelpers.js';

export default class NamespaceVariable extends Variable {
	constructor ( module ) {
		super( module.basename() );
		this.isNamespace = true;
		this.module = module;
		this.needsNamespaceBlock = false;

		this.originals = blank();
		module.getExports().concat( module.getReexports() ).forEach( name => {
			this.originals[ name ] = module.traceExport( name );
		} );
	}

	addReference ( node ) {
		this.name = node.name;
	}

	includeVariable () {
		const hasBeenIncluded = super.includeVariable();
		if ( hasBeenIncluded ) {
			this.needsNamespaceBlock = true;
			forOwn( this.originals, original => original.includeVariable() );
		}
		return hasBeenIncluded;
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
