(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, function () { 'use strict';

	function foo () {
		console.log( 'hello from foo.js' );
	}

	function bar () {
		console.log( 'hello from bar.js' );
	}

	console.log( 'hello from main.js' );

	foo();
	bar();

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW1kLmpzIiwic291cmNlcyI6WyIuLi9mb28uanMiLCIuLi9iYXIuanMiLCIuLi9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvbyAoKSB7XG5cdGNvbnNvbGUubG9nKCAnaGVsbG8gZnJvbSBmb28uanMnICk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiYXIgKCkge1xuXHRjb25zb2xlLmxvZyggJ2hlbGxvIGZyb20gYmFyLmpzJyApO1xufVxuIiwiaW1wb3J0IGZvbyBmcm9tICcuL2Zvbyc7XG5pbXBvcnQgYmFyIGZyb20gJy4vYmFyJztcblxuY29uc29sZS5sb2coICdoZWxsbyBmcm9tIG1haW4uanMnICk7XG5cbmZvbygpO1xuYmFyKCk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0NBQWUsU0FBUyxHQUFHLElBQUk7QUFDL0IsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQztBQUNwQyxDQUFBLENBQUM7O0NDRmMsU0FBUyxHQUFHLElBQUk7QUFDL0IsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQztBQUNwQyxDQUFBLENBQUM7O0NDQ0QsT0FBTyxDQUFDLEdBQUcsRUFBRSxvQkFBb0IsRUFBRSxDQUFDOztBQUVwQyxDQUFBLEdBQUcsRUFBRSxDQUFDO0FBQ04sQ0FBQSxHQUFHLEVBQUUsQ0FBQyw7OyJ9