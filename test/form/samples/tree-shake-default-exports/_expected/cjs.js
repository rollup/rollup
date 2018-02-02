'use strict';

/* header 1 */

/* footer 1 */

/* header 2 */

/* footer 2 */

/* header 3*/

/* leading retained */
console.log( 'side-effect' ) || 43; // trailing retained

/* footer 3 */

/* header 4 */

/* leading retained */
var importedValue = 42; // trailing retained

/* footer 4 */

/* header 5 */

/* leading retained */
function importedUsedFunction () {
	console.log( 'unnamed' );
} // trailing retained

/* footer 5 */

/* header 6 */

/* leading retained */
function usedNamedFunction () {
	console.log( 'named' );
} // trailing retained

/* footer 6 */

console.log(importedValue);
importedUsedFunction();
usedNamedFunction();
