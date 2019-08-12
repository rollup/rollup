const isCallable =
	typeof /abc/ === 'function'
		? function IsCallableSlow(x) {
				return typeof x === 'function' && _toString(x) === '[object Function]';
		  }
		: function IsCallableFast(x) {
				return typeof x === 'function';
		  };

console.log(isCallable(/x/));
