function decorator() {}

@decorator
@decorator2
class Test {
	@decorator
	a = 1;
	@decorator
	b() {}
}
