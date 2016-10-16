import { blank, forOwn, keys } from './utils/object.js';
import makeLegalIdentifier from './utils/makeLegalIdentifier.js';
import { UNKNOWN } from './ast/values.js';

export default class Declaration {
	constructor ( node, isParam ) {
		this.node = node;

		this.name = node.id ? node.id.name : node.name;
		this.exportName = null;
		this.isParam = isParam;

		this.isReassigned = false;
	}

	activate () {
		if ( this.activated ) return;
		this.activated = true;

		if ( this.isParam ) return;
		this.node.activate();
	}

	addReference ( reference ) {
		reference.declaration = this;

		if ( reference.name !== this.name ) {
			this.name = makeLegalIdentifier( reference.name ); // TODO handle differences of opinion
		}

		if ( reference.isReassignment ) this.isReassigned = true;
	}

	render ( es ) {
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}
}

export class SyntheticNamespaceDeclaration {
	constructor ( module ) {
		this.isNamespace = true;
		this.module = module;
		this.name = module.basename();

		this.needsNamespaceBlock = false;

		this.originals = blank();
		module.getExports().forEach( name => {
			this.originals[ name ] = module.traceExport( name );
		});
	}

	activate () {
		this.needsNamespaceBlock = true;

		// add synthetic references, in case of chained
		// namespace imports
		forOwn( this.originals, original => {
			original.activate();
		});
	}

	addReference ( node ) {
		this.name = node.name;
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN );
	}

	getName () {
		return this.name;
	}

	renderBlock ( es, legacy, indentString ) {
		const members = keys( this.originals ).map( name => {
			const original = this.originals[ name ];

			if ( original.isReassigned ) {
				return `${indentString}get ${name} () { return ${original.getName( es )}; }`;
			}
			if (legacy) {
				name = `'${name}'`;
			}

			return `${indentString}${name}: ${original.getName( es )}`;
		});

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

		this.activated = true;

		this.isNamespace = name === '*';
	}

	activate () {
		// noop
	}

	addReference ( reference ) {
		reference.declaration = this;

		if ( this.name === 'default' || this.name === '*' ) {
			this.module.suggestName( reference.name );
		}
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

	setSafeName ( name ) {
		this.safeName = name;
	}
}
