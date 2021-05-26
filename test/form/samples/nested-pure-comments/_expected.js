// Sequence expression
(keep());
keep();
const foo = (/*@__PURE__*/keep());

// Conditional expression
(keep() ? 1 : 2);
keep();

// Logical expression
(keep() || 1);
keep();

// Binary expression
(keep() / 1);
1  / keep();

export { foo };
