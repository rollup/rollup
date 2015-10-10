export default function transform ( source, id, transformers ) {
	let sourceMapChain = [];

	if ( typeof source === 'string' ) {
		source = {
			code: source,
			ast: null
		};
	}

	let originalCode = source.code;
	let ast = source.ast;

	let code = transformers.reduce( ( previous, transformer ) => {
		let result = transformer( previous, id );

		if ( result == null ) return previous;

		if ( typeof result === 'string' ) {
			result = {
				code: result,
				ast: null,
				map: null
			};
		}

		sourceMapChain.push( result.map );
		ast = result.ast;

		return result.code;
	}, source.code );

	return { code, originalCode, ast, sourceMapChain };
}
