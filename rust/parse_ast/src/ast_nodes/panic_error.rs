use crate::convert_ast::converter::ast_constants::{
  NODE_END_OFFSET, NODE_START_OFFSET, PANIC_ERROR_MESSAGE_OFFSET, PANIC_ERROR_RESERVED_BYTES,
  TYPE_PANIC_ERROR, WORD_SIZE,
};
use crate::convert_ast::converter::{convert_string, update_reference_position};

pub(crate) fn write_panic_error(buffer: &mut Vec<u8>, message: &str) {
  let node_byte_position = buffer.len();
  // type
  buffer.extend_from_slice(&TYPE_PANIC_ERROR);
  // parent
  buffer.extend_from_slice(&0u32.to_ne_bytes());
  debug_assert_eq!(
    buffer.len(),
    node_byte_position + NODE_START_OFFSET * WORD_SIZE
  );
  // reserve for start and end even though they are unused
  let end_position = buffer.len() + WORD_SIZE;
  debug_assert_eq!(
    end_position,
    node_byte_position + NODE_END_OFFSET * WORD_SIZE
  );
  buffer.resize(end_position + PANIC_ERROR_RESERVED_BYTES, 0);
  // message
  update_reference_position(buffer, end_position + PANIC_ERROR_MESSAGE_OFFSET);
  convert_string(buffer, message);
}
