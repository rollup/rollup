var self = {
	get p () { return p; }
};
if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
	Object.defineProperty(self, Symbol.toStringTag, { value: 'Module' });
else
	Object.defineProperty(self, 'toString', { value: function () { return '[object Module]' } });
/*#__PURE__*/Object.freeze(self);

console.log(Object.keys(self));

var p = 5;

export { p };
