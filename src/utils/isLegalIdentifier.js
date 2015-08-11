export default function isLegalIdentifier ( id ) {
  return /^[$_a-zA-Z0-9]+$/.test( id ) && !/^[0-9]/.test( id );
}
