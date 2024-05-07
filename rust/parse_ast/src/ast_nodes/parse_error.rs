use crate::convert_ast::converter::ast_constants::{
  PARSE_ERROR_MESSAGE_OFFSET, PARSE_ERROR_RESERVED_BYTES, TYPE_PARSE_ERROR,
};
use crate::convert_ast::converter::update_reference_position;

pub fn get_parse_error_buffer(error_buffer: &[u8], utf_16_pos: &u32) -> Vec<u8> {
  // type
  let mut buffer = TYPE_PARSE_ERROR.to_vec();
  // start
  buffer.extend_from_slice(&utf_16_pos.to_ne_bytes());
  // end
  let end_position = buffer.len();
  buffer.resize(end_position + PARSE_ERROR_RESERVED_BYTES, 0);
  // message, the string is already converted to a buffer via convert_string
  update_reference_position(&mut buffer, end_position + PARSE_ERROR_MESSAGE_OFFSET);
  buffer.extend_from_slice(&error_buffer[4..]);
  buffer
}
