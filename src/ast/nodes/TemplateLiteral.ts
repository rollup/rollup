import Node from '../Node';

export default class TemplateLiteral extends Node {
	render ( code, es ) {
		code.indentExclusionRanges.push( [ this.start, this.end ] );
		super.render( code, es );
	}
}
