/*@__NO_SIDE_EFFECTS__*/
const foo = () => console.log(), bar = () => console.log();

// should be removed
foo();

// should be retained, but the annotation needs to be removed, otherwise it
// will appear to be side effect free for downstream consumers.
bar();
