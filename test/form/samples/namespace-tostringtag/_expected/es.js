var self = {
	get p () { return p$$1; }
};
if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
	Object.defineProperty(self, Symbol.toStringTag, { value: 'Module' });
else
	Object.defineProperty(self, 'toString', { value: function () { return '[object Module]' } });
/*#__PURE__*/Object.freeze(self);

console.log(Object.keys(self));

var p$$1 = 5;

export { p$$1 as p };
