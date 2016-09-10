import Node from '../Node.js';

export default class TemplateLiteral extends Node {
	render ( code, es ) {
		code.indentExclusionRanges.push([ this.start, this.end ]);
		super.render( code, es );
	}
}
