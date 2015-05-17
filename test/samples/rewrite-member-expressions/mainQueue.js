var queue = [];

export function addToQueue ( x ) {
	queue.push( x );
}

export function getQueueItem ( i ) {
	return queue[i];
}