const obj = {
	nullValue: null,
	method() {
		return { nullValue: null };
	}
};
obj?.nullValue.foo; // retained
obj?.nullValue(); // retained
obj?.nullValue(console.log('effect')); // retained
obj.method?.(console.log('effect')); // retained
obj?.method(console.log('effect')); // retained
