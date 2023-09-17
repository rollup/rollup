// Sequence expression
/*@__PURE__*/(keep(), /*@__PURE__*/remove());
/*@__PURE__*/remove(), keep(), /*@__PURE__*/remove();
/*@__PURE__*/remove(), /*@__PURE__*/remove();
export const foo = /*@__PURE__*/(/*@__PURE__*/remove(), /*@__PURE__*/keep());

// Conditional expression
/*@__PURE__*/(keep() ? 1 : 2);
/*@__PURE__*/remove() ? /*@__PURE__*/remove() : /*@__PURE__*/remove();
false ? 1 /*@__PURE__*/ : keep();

// Logical expression
/*@__PURE__*/(keep() || 1);
/*@__PURE__*/remove() || /*@__PURE__*/remove();
false /*@__PURE__*/ || keep();

// Binary expression
/* @__PURE__ */(keep() / 1);
/* @__PURE__ */remove() / /* @__PURE__ */remove();
1 /* @__PURE__ */ / keep();

// Calls with parentheses
/*@__PURE__*/(remove());
/*@__PURE__*/(((remove())));
/*@__PURE__*/(new Remove());
/*@__PURE__*/(((new Remove())));
