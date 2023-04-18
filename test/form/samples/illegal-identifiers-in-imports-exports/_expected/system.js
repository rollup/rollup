System.register('illegalIdentifiers', ['external'], (function (exports) {
	'use strict';
	var _safe, _safe$1;
	return {
		setters: [function (module) {
			_safe = module[":"];
			_safe$1 = module["🤷‍♂️"];
			exports({ '-': module.bar, '/': module["/"], '🍅': module, '😭': module["😂"] });
		}],
		execute: (function () {

			console.log(_safe, _safe$1); // retain those local bindings

			const legal = exports('🔥illegal', 10);

		})
	};
}));
