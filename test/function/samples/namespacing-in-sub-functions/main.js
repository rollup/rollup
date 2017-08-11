import { problematicFunc as otherFunc } from './problematicFunc';
function innerFunc() {
	function problematicFunc () {
		return otherFunc();
	}
	return problematicFunc();
}

var res = innerFunc();

export default res;