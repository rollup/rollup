// Generate strings which dereference dotted properties, but use array notation `['prop-deref']`
// if the property name isn't trivial

const shouldUseDot = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/;
const dereferenceString = prop =>
    prop.match(shouldUseDot) ? `.${prop}` : `['${prop}']`;

/**
 * returns a function which generates property dereference strings for the given name
 *
 * const getGlobalProp = propertyStringFor('global');
 * getGlobalProp('foo.bar-baz.qux') => `global.bar['bar-baz'].qux`
 */
const propertyStringFor = objName => propName =>
  objName + propName.split('.').map(dereferenceString).join('');


export default propertyStringFor;