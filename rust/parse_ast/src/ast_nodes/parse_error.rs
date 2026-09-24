use crate::convert_ast::converter::ast_constants::{
  PARSE_ERROR_MESSAGE_OFFSET, PARSE_ERROR_RESERVED_BYTES, TYPE_PARSE_ERROR,
};
use crate::convert_ast::converter::{convert_string, update_reference_position};

pub(crate) fn write_parse_error(buffer: &mut Vec<u8>, utf_16_pos: u32, message: &str) {
  // type
  buffer.extend_from_slice(&TYPE_PARSE_ERROR);
  // start
  buffer.extend_from_slice(&utf_16_pos.to_ne_bytes());
  // end
  let end_position = buffer.len();
  buffer.resize(end_position + PARSE_ERROR_RESERVED_BYTES, 0);
  // message
  update_reference_position(buffer, end_position + PARSE_ERROR_MESSAGE_OFFSET);
  convert_string(buffer, message);
}
