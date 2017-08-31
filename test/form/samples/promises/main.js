const p1 = new Promise( () => {
	console.log( 'fire & forget' );
} );

const p2 = new Promise( () => {
	console.info( 'forget me as well' );
} );

const p3 = new Promise( () => {
	console.info( 'and me too' );
} );

const p4 = Promise.resolve('no side effect');
const p5 = Promise.reject('should be kept for uncaught rejections');

const all = Promise.all([p2, p3]);
export const allExported = Promise.all([p2, p3]);
const race = Promise.race([p2, p3]);
