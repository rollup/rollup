const nope = method => `Cannot use fs.${method} inside browser`;

export const isFile = () => false;
export const readFile = nope( 'readFileSync' );
export const writeFile = nope( 'writeFile' );
