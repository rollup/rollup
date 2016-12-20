import Statement from './shared/Statement.js';

export default class EmptyStatement extends Statement {
	render ( code ) {
		if ( this.parent.type === 'BlockStatement' || this.parent.type === 'Program' ) {
			code.remove( this.start, this.end );
		}
	}
}
