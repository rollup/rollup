var obj = {
	set: function ( key, value ) {
		this[ key ] = value;
	},

	get: function ( key ) {
		return this[ key ];
	}
};

obj.set( 'answer', 42 );

export default function ( key ) {
	return obj.get( key );
}
