const bar = () => console.log();

// should be retained, but the annotation needs to be removed, otherwise it
// will appear to be side effect free for downstream consumers.
bar();
