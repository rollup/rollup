import nodes from './nodes/index';
import UnknownNode from './nodes/UnknownNode';
import keys from './keys';

const newline = /\n/;

export default function enhance ( ast, module, comments ) {
	enhanceNode( ast, module, module, module.magicString );

	let comment = comments.shift();

	for ( const node of ast.body ) {
		if ( comment && ( comment.start < node.start ) ) {
			node.leadingCommentStart = comment.start;
		}

		while ( comment && comment.end < node.end ) comment = comments.shift();

		// if the next comment is on the same line as the end of the node,
		// treat is as a trailing comment
		if ( comment && !newline.test( module.code.slice( node.end, comment.start ) ) ) {
			node.trailingCommentEnd = comment.end; // TODO is node.trailingCommentEnd used anywhere?
			comment = comments.shift();
		}

		node.initialise( module.scope );
	}
}

function enhanceNode ( raw, parent, module, code ) {
	if ( !raw ) return;

	if ( 'length' in raw ) {
		for ( let i = 0; i < raw.length; i += 1 ) {
			enhanceNode( raw[i], parent, module, code );
		}

		return;
	}

	// with e.g. shorthand properties, key and value are
	// the same node. We don't want to enhance an object twice
	if ( raw.__enhanced ) return;
	raw.__enhanced = true;

	if ( !keys[ raw.type ] ) {
		keys[ raw.type ] = Object.keys( raw ).filter( key => typeof raw[ key ] === 'object' );
	}

	raw.parent = parent;
	raw.module = module;
	raw.keys = keys[ raw.type ];

	code.addSourcemapLocation( raw.start );
	code.addSourcemapLocation( raw.end );

	for ( const key of keys[ raw.type ] ) {
		enhanceNode( raw[ key ], raw, module, code );
	}

	const type = nodes[ raw.type ] || UnknownNode;
	raw.__proto__ = type.prototype;
}
