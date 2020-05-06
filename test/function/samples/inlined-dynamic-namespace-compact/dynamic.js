import value from './lib';
export default import('./other-dynamic').then(other => other.default + value);
