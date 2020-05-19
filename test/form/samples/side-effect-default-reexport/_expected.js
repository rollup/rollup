var Menu = {
	name: 'menu'
};

var Item = {
	name: 'item'
};

Menu.Item1 = Item;

Menu.Item2 = Item;

var NamedExport = {
	name: 'menu'
};

var Menu$1 = {
	name: 'menu'
};

var Item$1 = {
	name: 'item'
};

Menu$1.Item1 = Item$1;

Menu$1.Item2 = Item$1;

console.log('test-package-default-export', Menu.Item);
console.log('test-package-named-export', NamedExport.Item);

export default Menu$1;
