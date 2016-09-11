const DEBUG = false;
const map = new Map;

let time;

if ( typeof process === 'undefined' ) {
	time = function time ( previous ) {
		const now = window.performance.now();
		return previous ? previous - now : now;
	};
} else {
	time = function time ( previous ) {
		if ( previous ) {
			const hrtime = process.hrtime( previous );
			return hrtime[0] * 1e3 + hrtime[1] / 1e6;
		}
	};
}

export function timeStart ( label ) {
	if ( !map.has( label ) ) {
		map.set( label, {
			time: 0
		});
	}
	map.get( label ).start = time();
}

export function timeEnd ( label ) {
	if ( map.has( label ) ) {
		const item = map.get( label );
		item.time += time( item.start );
	}
}

export function flushTime ( log = defaultLog ) {
	for ( const item of map.entries() ) {
		log( item[0], item[1].time );
	}
	map.clear();
}

function defaultLog ( label, time ) {
	if ( DEBUG ) {
		/* eslint-disable no-console */
		console.info( '%dms: %s', time, label );
		/* eslint-enable no-console */
	}
}
