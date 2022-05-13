// TODO Lukas also check side effects
//  * a call has effects when a side-effectful default is triggered
//  * defaults do not give side effects to the declaration itself
//  * if a default does not have a side effect and the variable is unused, it does not need to be included
module.exports = {
	description: 'supports tree-shaking for unused default parameter values on classes'
};
