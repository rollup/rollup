var Menu$1 = {
	};

var Item$2 = {
	name: 'item'
};

/* default-export/index2 */
Menu$1.Item1 = Item$2;

/* default-export/index */
Menu$1.Item2 = Item$2;

var NamedExport = {
	};

var Item$1 = {
	name: 'item'
};

/* named-export/index2 */
NamedExport.Item1 = Item$1;

/* named-export/index */
NamedExport.Item2 = Item$1;

var Menu = {
	name: 'menu'
};

var Item = {
	name: 'item'
};

/* default-export2/index2 */
Menu.Item1 = Item;

/* default-export2/index */
Menu.Item2 = Item;

console.log('test-package-default-export', Menu$1.Item);
console.log('test-package-named-export', NamedExport.Item);

export { Menu as default };
