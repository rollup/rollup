var prop,
answer;

var foo = { answer: 'wrong' };
var bar = { answer: 'right' };

if ( typeof bar === "object" ) {
	for ( prop in bar ) {
		if ( bar.hasOwnProperty(prop) ) {
			foo[prop] = bar[prop];
		}
	}
}

answer = getAnswer( foo );

export default answer;
