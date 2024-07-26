const obj = {
	nullValue: null,
	undefinedValue: undefined,
	method() {
		return { nullValue: null };
	}
};

obj.nullValue?.foo; // removed
obj?.nullValue.foo; // retained
obj.nullValue?.(); // removed
obj.nullValue?.(console.log('effect')); // removed
obj?.nullValue(); // retained
obj?.nullValue(console.log('effect')); // retained
obj.method?.(); // removed
obj.method?.(console.log('effect')); // retained
obj?.method(); // removed
obj?.method(console.log('effect')); // retained
obj.method().nullValue?.foo; // removed
obj.method().nullValue?.(); // removed
obj.method().nullValue?.(console.log('effect')); // removed
(true && obj.nullValue)?.foo; // removed
(true && obj.nullValue)?.(); // removed
(true && obj.nullValue)?.(console.log('effect')); // removed
