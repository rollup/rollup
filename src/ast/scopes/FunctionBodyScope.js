import Scope from './Scope';
import ParameterVariable from '../variables/ParameterVariable';

export default class FunctionBodyScope extends Scope {
	constructor ( options = {} ) {
		super( Object.assign( {}, options, { isLexicalBoundary: true } ) );
		this.variables.arguments = new ParameterVariable( 'arguments' );
	}
}
