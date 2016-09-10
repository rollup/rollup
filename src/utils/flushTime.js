const DEBUG = false;
const map = new Map;

export function timeStart ( label ) {
	if ( !map.has( label ) ) {
		map.set( label, {
			time: 0
		});
	}
	map.get( label ).start = process.hrtime();
}

export function timeEnd ( label ) {
	if ( map.has( label ) ) {
		const item = map.get( label );
		item.time += toMilliseconds( process.hrtime( item.start ) );
	}
}

export function flushTime ( log = defaultLog ) {
	for ( const item of map.entries() ) {
		log( item[0], item[1].time );
	}
	map.clear();
}

function toMilliseconds ( time ) {
	return time[0] * 1e+3 + Math.floor( time[1] * 1e-6 );
}

function defaultLog ( label, time ) {
	if ( DEBUG ) {
		/* eslint-disable no-console */
		console.info( '%dms: %s', time, label );
		/* eslint-enable no-console */
	}
}
