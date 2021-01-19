var Menu = {
	name: 'menu'
};

var Item = {
	name: 'item'
};

/* default-export/index2 */
Menu.Item1 = Item;

/* default-export/index */
Menu.Item2 = Item;

var NamedExport = {
	name: 'menu'
};

var Item$1 = {
	name: 'item'
};

/* named-export/index2 */
NamedExport.Item1 = Item$1;

/* named-export/index */
NamedExport.Item2 = Item$1;

var Menu$1 = {
	name: 'menu'
};

var Item$2 = {
	name: 'item'
};

/* default-export2/index2 */
Menu$1.Item1 = Item$2;

/* default-export2/index */
Menu$1.Item2 = Item$2;

console.log('test-package-default-export', Menu.Item);
console.log('test-package-named-export', NamedExport.Item);

export default Menu$1;
