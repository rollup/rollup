import x from'external';var self=/*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({__proto__:null,get default(){return foo}},Symbol.toStringTag,{value:'Module'}));console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
export{foo as default};