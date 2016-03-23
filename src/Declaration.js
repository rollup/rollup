import { blank, forOwn, keys } from './utils/object.js';
import run from './utils/run.js';
import { SyntheticReference } from './Reference.js';

const use = alias => alias.use();

export default class Declaration {
	constructor ( node, isParam, statement ) {
		if ( node ) {
			if ( node.type === 'FunctionDeclaration' ) {
				this.isFunctionDeclaration = true;
				this.functionNode = node;
			} else if ( node.type === 'VariableDeclarator' && node.init && /FunctionExpression/.test( node.init.type ) ) {
				this.isFunctionDeclaration = true;
				this.functionNode = node.init;
			}
		}

		this.statement = statement;
		this.name = null;
		this.exportName = null;
		this.isParam = isParam;

		this.isReassigned = false;
		this.aliases = [];

		this.isUsed = false;
	}

	addAlias ( declaration ) {
		this.aliases.push( declaration );
	}

	addReference ( reference ) {
		reference.declaration = this;
		this.name = reference.name; // TODO handle differences of opinion

		if ( reference.isReassignment ) this.isReassigned = true;
	}

	render ( es6 ) {
		if ( es6 ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	run ( strongDependencies ) {
		if ( this.tested ) return this.hasSideEffects;


		if ( !this.functionNode ) {
			this.hasSideEffects = true; // err on the side of caution. TODO handle unambiguous `var x; x = y => z` cases
		} else {
			if ( this.running ) return true; // short-circuit infinite loop
			this.running = true;

			this.hasSideEffects = run( this.functionNode.body, this.functionNode._scope, this.statement, strongDependencies, false );

			this.running = false;
		}

		this.tested = true;
		return this.hasSideEffects;
	}

	use () {
		if ( this.isUsed ) return;

		this.isUsed = true;
		if ( this.statement ) this.statement.mark();

		this.aliases.forEach( use );
	}
}

export class SyntheticDefaultDeclaration {
	constructor ( node, statement, name ) {
		this.node = node;
		this.statement = statement;
		this.name = name;

		this.original = null;
		this.exportName = null;
		this.aliases = [];
	}

	addAlias ( declaration ) {
		this.aliases.push( declaration );
	}

	addReference ( reference ) {
		// Bind the reference to `this` declaration.
		reference.declaration = this;

		// Don't change the name to `default`; it's not a valid identifier name.
		if ( reference.name === 'default' ) return;

		this.name = reference.name;
	}

	bind ( declaration ) {
		this.original = declaration;
	}

	render () {
		return !this.original || this.original.isReassigned ?
			this.name :
			this.original.render();
	}

	run ( strongDependencies ) {
		if ( this.original ) {
			return this.original.run( strongDependencies );
		}

		let declaration = this.node.declaration;
		while ( declaration.type === 'ParenthesizedExpression' ) declaration = declaration.expression;

		if ( /FunctionExpression/.test( declaration.type ) ) {
			return run( declaration.body, this.statement.scope, this.statement, strongDependencies, false );
		}

		// otherwise assume the worst
		return true;
	}

	use () {
		this.isUsed = true;
		this.statement.mark();

		if ( this.original ) this.original.use();

		this.aliases.forEach( use );
	}
}

export class SyntheticGlobalDeclaration {
	constructor ( name ) {
		this.name = name;
		this.isExternal = true;
		this.isGlobal = true;
		this.isReassigned = false;

		this.aliases = [];

		this.isUsed = false;
	}

	addAlias ( declaration ) {
		this.aliases.push( declaration );
	}

	addReference ( reference ) {
		reference.declaration = this;
		if ( reference.isReassignment ) this.isReassigned = true;
	}

	render () {
		return this.name;
	}

	run () {
		return true;
	}

	use () {
		if ( this.isUsed ) return;
		this.isUsed = true;

		this.aliases.forEach( use );
	}
}

export class SyntheticNamespaceDeclaration {
	constructor ( module ) {
		this.isNamespace = true;
		this.module = module;
		this.name = null;

		this.needsNamespaceBlock = false;
		this.aliases = [];

		this.originals = blank();
		module.getExports().forEach( name => {
			this.originals[ name ] = module.traceExport( name );
		});
	}

	addAlias ( declaration ) {
		this.aliases.push( declaration );
	}

	addReference ( reference ) {
		// if we have e.g. `foo.bar`, we can optimise
		// the reference by pointing directly to `bar`
		if ( reference.parts.length ) {
			const ref = reference.parts.shift();
			reference.name = ref.name;
			reference.end = ref.end;

			const original = this.originals[ reference.name ];

			// throw with an informative error message if the reference doesn't exist.
			if ( !original ) {
				this.module.bundle.onwarn( `Export '${reference.name}' is not defined by '${this.module.id}'` );
				reference.isUndefined = true;
				return;
			}

			original.addReference( reference );
			return;
		}

		// otherwise we're accessing the namespace directly,
		// which means we need to mark all of this module's
		// exports and render a namespace block in the bundle
		if ( !this.needsNamespaceBlock ) {
			this.needsNamespaceBlock = true;
			this.module.bundle.internalNamespaces.push( this );

			// add synthetic references, in case of chained
			// namespace imports
			forOwn( this.originals, ( original, name ) => {
				original.addReference( new SyntheticReference( name ) );
			});
		}

		reference.declaration = this;
		this.name = reference.name;
	}

	renderBlock ( indentString ) {
		const members = keys( this.originals ).map( name => {
			const original = this.originals[ name ];

			if ( original.isReassigned ) {
				return `${indentString}get ${name} () { return ${original.render()}; }`;
			}

			return `${indentString}${name}: ${original.render()}`;
		});

		return `var ${this.render()} = Object.freeze({\n${members.join( ',\n' )}\n});\n\n`;
	}

	render () {
		return this.name;
	}

	use () {
		forOwn( this.originals, use );
		this.aliases.forEach( use );
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

		return es6 ? this.safeName : `${this.module.name}.${this.name}`;
	}

	run () {
		return true;
	}

	setSafeName ( name ) {
		this.safeName = name;
	}

	use () {
		// noop?
	}
}
