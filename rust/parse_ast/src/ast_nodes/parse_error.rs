use crate::convert_ast::converter::ast_constants::{
  NODE_END_OFFSET, NODE_START_OFFSET, PARSE_ERROR_MESSAGE_OFFSET, PARSE_ERROR_RESERVED_BYTES,
  TYPE_PARSE_ERROR, WORD_SIZE,
};
use crate::convert_ast::converter::{convert_string, update_reference_position};

pub(crate) fn write_parse_error(buffer: &mut Vec<u8>, utf_16_pos: u32, message: &str) {
  let node_byte_position = buffer.len();
  // type
  buffer.extend_from_slice(&TYPE_PARSE_ERROR);
  // parent
  buffer.extend_from_slice(&0u32.to_ne_bytes());
  debug_assert_eq!(
    buffer.len(),
    node_byte_position + NODE_START_OFFSET * WORD_SIZE
  );
  // start
  buffer.extend_from_slice(&utf_16_pos.to_ne_bytes());
  debug_assert_eq!(
    buffer.len(),
    node_byte_position + NODE_END_OFFSET * WORD_SIZE
  );
  // end
  let end_position = buffer.len();
  buffer.resize(end_position + PARSE_ERROR_RESERVED_BYTES, 0);
  // message
  update_reference_position(buffer, end_position + PARSE_ERROR_MESSAGE_OFFSET);
  convert_string(buffer, message);
}
