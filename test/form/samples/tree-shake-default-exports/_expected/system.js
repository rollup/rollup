System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			/* header 1 */

			/* footer 1 */

			/* header 2 */

			/* footer 2 */

			/* header 3 */

			/* leading retained */
			/*#__KEEP__*/ console.log( 'side-effect' ) || 43; // trailing retained

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

			/* header 7 */

			/* leading retained */
(			{
				effect: console.log( 'side-effect' ) || 43
			}); // trailing retained

			/* footer 7 */

			/* header 8 */

			/* leading retained */
(			{
				effect: console.log( 'side-effect' ) || 43
			}); // trailing retained

			/* footer 8 */

			console.log(importedValue);
			importedUsedFunction();
			usedNamedFunction();

		}
	};
});
