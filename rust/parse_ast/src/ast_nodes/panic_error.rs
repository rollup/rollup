use crate::convert_ast::converter::ast_constants::{
  PANIC_ERROR_MESSAGE_OFFSET, PANIC_ERROR_RESERVED_BYTES, TYPE_PANIC_ERROR,
};
use crate::convert_ast::converter::{convert_string, update_reference_position};

pub(crate) fn write_panic_error(buffer: &mut Vec<u8>, message: &str) {
  // type
  buffer.extend_from_slice(&TYPE_PANIC_ERROR);
  // reserve for start and end even though they are unused
  let end_position = buffer.len() + 4;
  buffer.resize(end_position + PANIC_ERROR_RESERVED_BYTES, 0);
  // message
  update_reference_position(buffer, end_position + PANIC_ERROR_MESSAGE_OFFSET);
  convert_string(buffer, message);
}
