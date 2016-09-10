import Statement from './shared/Statement.js';

export default class EmptyStatement extends Statement {
	render ( code ) {
		code.remove( this.start, this.end );
	}
}
