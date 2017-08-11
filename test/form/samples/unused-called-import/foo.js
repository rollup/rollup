import dead from './dead';

export default function() { return 'foo'; }

export function foodead() { return 'foo' + dead(); }
