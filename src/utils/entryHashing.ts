const CHAR_CODE_A = 97;

export function Uint8ArrayToHexString (buffer: Uint8Array) {
  let str = '';
  // hex conversion - 2 chars per 8 bit component
  for (let i = 0; i < buffer.length; i++) {
    const num = buffer[i];
    // big endian conversion, but whatever
    str += String.fromCharCode(CHAR_CODE_A + num >> 4);
    str += String.fromCharCode(CHAR_CODE_A + num & 0xF);
  }
  return str;
}

export function Uint8ArrayXor (to: Uint8Array, from: Uint8Array) {
  for (let i = 0; i < to.length; i++)
    to[i] = to[i] ^ from[i];
  return to;
}

export function randomUint8Array (len: number) {
  const buffer = new Uint8Array(len);
  for (let i = 0; i < buffer.length; i++)
    buffer[i] = Math.random() * (2 << 8);
  return buffer;
}