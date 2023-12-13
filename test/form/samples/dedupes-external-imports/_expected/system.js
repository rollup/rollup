System.register('myBundle', ['external'], (function (exports) {
	'use strict';
	var Component;
	return {
		setters: [function (module) {
			Component = module.Component;
		}],
		execute: (function () {

			class Foo extends Component {
				constructor () {
					super();
					this.isFoo = true;
				}
			}

			class Bar extends Component {
				constructor () {
					super();
					this.isBar = true;
				}
			}

			class Baz extends Component {
				constructor () {
					super();
					this.isBaz = true;
				}
			}

			const foo = exports("foo", new Foo());
			const bar = exports("bar", new Bar());
			const baz = exports("baz", new Baz());

		})
	};
}));
