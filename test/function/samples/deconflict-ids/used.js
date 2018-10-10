export default function foo() {
	foo = function(x){
		return x + 1;
	};
	return foo.apply(this, arguments);
}
