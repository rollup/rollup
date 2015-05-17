import { addToQueue, getQueueItem } from './mainQueue';
import getLengthOfOtherQueue from './getLengthOfOtherQueue';

addToQueue( 42 );

assert.equal( getQueueItem( 0 ), 42 );
assert.equal( getLengthOfOtherQueue(), 1000 );