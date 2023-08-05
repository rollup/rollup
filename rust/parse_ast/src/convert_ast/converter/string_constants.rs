// These need to correspond to the positions in convert-ast-strings.ts
pub const STRING_VAR: [u8; 4] = 0u32.to_ne_bytes(); // var
pub const STRING_LET: [u8; 4] = 1u32.to_ne_bytes(); // let
pub const STRING_CONST: [u8; 4] = 2u32.to_ne_bytes(); // const
pub const STRING_INIT: [u8; 4] = 3u32.to_ne_bytes(); // init
pub const STRING_GET: [u8; 4] = 4u32.to_ne_bytes(); // get
pub const STRING_SET: [u8; 4] = 5u32.to_ne_bytes(); // set
pub const STRING_CONSTRUCTOR: [u8; 4] = 6u32.to_ne_bytes(); // constructor
pub const STRING_METHOD: [u8; 4] = 7u32.to_ne_bytes(); // method
