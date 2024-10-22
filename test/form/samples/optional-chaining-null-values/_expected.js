const obj = {
	nullValue: null,
	undefinedValue: undefined,
	method() {
		return { nullValue: null };
	}
};
obj?.nullValue.foo; // retained
obj?.nullValue(); // retained
obj?.nullValue(console.log('effect')); // retained
obj.method?.(console.log('effect')); // retained
obj?.method(console.log('effect')); // retained
