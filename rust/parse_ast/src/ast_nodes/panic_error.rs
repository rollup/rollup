use crate::convert_ast::converter::ast_constants::{
  PANIC_ERROR_MESSAGE_OFFSET, PANIC_ERROR_RESERVED_BYTES, TYPE_PANIC_ERROR,
};
use crate::convert_ast::converter::{convert_string, update_reference_position};

pub fn get_panic_error_buffer(message: &str) -> Vec<u8> {
  // type
  let mut buffer = TYPE_PANIC_ERROR.to_vec();
  // reserve for start and end even though they are unused
  let end_position = buffer.len() + 4;
  buffer.resize(end_position + PANIC_ERROR_RESERVED_BYTES, 0);
  // message
  update_reference_position(&mut buffer, end_position + PANIC_ERROR_MESSAGE_OFFSET);
  convert_string(&mut buffer, message);
  buffer
}
