import { blank } from '../../../utils/object.js';
import { unknown } from '../../values.js';

class AsyncFunctionReturnValue {
	constructor ( value ) {
		this.value = value;
	}

	getProperty () {
		// TODO express promise semantics somehow?
		return unknown;
	}
}

export default class FunctionValue {
	constructor ( node ) {
		this.node = node;
		this.values = blank();
	}

	call ( context, args ) {
		if ( this.node.isCalling ) return; // recursive functions
		this.node.isCalling = true;

		let returnValue;
		this.node.body.scope.initialise();

		args.forEach( ( arg, i ) => {
			const param = this.node.params[i];

			if ( !param ) return;

			if ( param.type !== 'Identifier' ) {
				throw new Error( 'TODO desctructuring' );
			}

			this.node.body.scope.setValue( param.name, arg );
		});

		for ( const node of this.node.body.body ) {
			node.run();
			if ( node.type === 'ReturnStatement' ) {
				returnValue = node.argument ? node.argument.run() : undefined; // TODO represent undefined
				break;
			}
		}

		this.node.isCalling = false;

		return this.node.async ? new AsyncFunctionReturnValue( returnValue ) : returnValue;
	}

	getProperty ( name ) {
		return this.values[ name ]; // TODO .length etc
	}

	markReturnStatements () {
		this.node.returnStatements.forEach( statement => statement.mark() );
	}

	setProperty ( name, value ) {
		// TODO unknown names
		this.values[ name ] = value;
	}
}
