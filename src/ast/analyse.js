export default function analyse ( magicString, module ) {
	// first we need to generate comprehensive scope info
	let previousStatement = null;
	let commentIndex = 0;

	module.statements.forEach( statement => {
		const node = statement.node;

		let trailing = !!previousStatement;
		let previousComment;

		// TODO surely this can be neater
		// attach leading comment
		do {
			let comment = module.comments[ commentIndex ];

			// prevent comments inside the previous statement being
			// appended to it
			if ( previousStatement ) {
				while ( comment && comment.start < previousStatement.node.end ) {
					commentIndex += 1;
					comment = module.comments[ commentIndex ];
				}
			}

			if ( !comment || ( comment.end > node.start ) ) break;

			// attach any trailing comment to the previous statement
			if ( trailing && !/\n/.test( module.source.slice( previousStatement.node.end, comment.start ) ) ) {
				previousStatement.trailingComment = comment;
			}

			// then attach leading comments to this statement
			else {
				statement.leadingComments.push({
					separator: previousComment ? magicString.slice( previousComment.end, comment.start ) : '\n',
					comment
				});

				previousComment = comment;
			}

			commentIndex += 1;
			trailing = false;
		} while ( module.comments[ commentIndex ] );

		// determine margin
		const previousEnd = previousComment ?
			previousComment.end :
			previousStatement ?
				( previousStatement.trailingComment || previousStatement.node ).end :
				0;

		//const start = ( statement.leadingComments[0] || node ).start;

		const gap = magicString.original.slice( previousEnd, node.start );
		const margin = gap.split( '\n' ).length;

		if ( previousStatement ) previousStatement.margin[1] = margin;
		statement.margin[0] = margin;

		statement.analyse();

		previousStatement = statement;
	});
}
