export default function ensureArray ( thing ) {
	if ( Array.isArray( thing ) ) return thing;
	if ( thing == undefined ) return [];
	return [ thing ];
}
