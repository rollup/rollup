const object = {};
const propertyIsEnumerable1 = object.propertyIsEnumerable( 'toString' );
const propertyIsEnumerable2 = {}.propertyIsEnumerable( 'toString' );
const propertyIsEnumerable3 = {}.propertyIsEnumerable( 'toString' ).valueOf();

const _hasOwnProperty = {}.hasOwnProperty( 'toString' ).valueOf();
const _isPrototypeOf = {}.isPrototypeOf( {} ).valueOf();
const _propertyIsEnumerable = {}.propertyIsEnumerable( 'toString' ).valueOf();
const _toLocaleString = {}.toLocaleString().trim();
const _toString = {}.toString().trim();
const _valueOf = {}.valueOf();
