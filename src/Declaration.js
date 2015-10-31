import { walk } from 'estree-walker';
import { keys } from './utils/object';

const modifierNodes = {
	AssignmentExpression: 'left',
	UpdateExpression: 'argument'
};

export default class Declaration {
	constructor ( node ) {
		if ( node ) {
			if ( node.type === 'FunctionDeclaration' ) {
				this.isFunctionDeclaration = true;
				this.functionBody = node.body;
			} else if ( node.type === 'VariableDeclarator' && node.init && /FunctionExpression/.test( node.init.type ) ) {
				this.isFunctionDeclaration = true;
				this.functionBody = node.init.body;
			}
		}

		this.statement = null;
		this.name = null;

		this.isReassigned = false;
		this.aliases = [];
	}

	addAlias ( declaration ) {
		this.aliases.push( declaration );
	}

	addReference ( reference ) {
		reference.declaration = this;
		this.name = reference.name; // TODO handle differences of opinion

		if ( reference.isReassignment ) this.isReassigned = true;
	}

	mutates () {
		// returns a list of things this function mutates when it gets called
		if ( !this._mutates ) {
			let mutatedNames = {};

			const statement = this.statement;
			let scope = statement.scope;

			const addNode = node => {
				while ( node.type === 'MemberExpression' ) node = node.object;
				if ( node.type === 'Identifier' ) mutatedNames[ node.name ] = true;
			};

			walk( this.functionBody, {
				enter ( node ) {
					if ( node._scope ) scope = node._scope;

					if ( node.type in modifierNodes ) {
						addNode( node[ modifierNodes[ node.type ] ] );
					} else if ( node.type === 'CallExpression' ) {
						addNode( node.callee );
					}
				},

				leave ( node ) {
					if ( node._scope ) scope = scope.parent;
				}
			});

			this._mutates = keys( mutatedNames );
		}

		return this._mutates;
	}

	render ( es6 ) {
		if ( es6 ) return this.name;
		if ( !this.isReassigned || !this.isExported ) return this.name;

		return `exports.${this.name}`;
	}

	use () {
		this.isUsed = true;
		if ( this.statement ) this.statement.mark();

		this.aliases.forEach( alias => alias.use() );
	}
}
