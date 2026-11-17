use std::{io::Write, mem::take, sync::Arc};

use anyhow::Error;
use parking_lot::Mutex;
use swc_common::errors::{DiagnosticBuilder, Emitter, Handler, Level, HANDLER};

use crate::ast_nodes::parse_error::get_parse_error_buffer;
use crate::convert_ast::converter::convert_string;

#[derive(Clone, Default)]
struct Writer(Arc<Mutex<Vec<u8>>>);

impl Write for Writer {
  fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
    let mut lock = self.0.lock();

    lock.extend_from_slice(buf);

    Ok(buf.len())
  }
  fn flush(&mut self) -> std::io::Result<()> {
    Ok(())
  }
}

pub(crate) struct ErrorEmitter {
  wr: Box<Writer>,
}

impl Emitter for ErrorEmitter {
  fn emit(&mut self, db: &mut DiagnosticBuilder<'_>) {
    if db.level == Level::Error {
      let mut buffer = Vec::new();
      let mut pos: u32 = 0;
      if let Some(span) = db.span.primary_span() {
        pos = span.lo.0 - 1;
      };
      let message = &db.message[0].0;
      buffer.extend_from_slice(&pos.to_ne_bytes());
      convert_string(&mut buffer, message);
      let _ = self.wr.write(&buffer);
    }
  }
}

pub(crate) fn try_with_handler<T, F>(code: &str, swap_byte_order: bool, op: F) -> Result<T, Vec<u8>>
where
  F: FnOnce(&Handler) -> Result<T, Error>,
{
  let wr = Box::<Writer>::default();

  let emitter = ErrorEmitter { wr: wr.clone() };

  let handler = Handler::with_emitter(true, false, Box::new(emitter));

  let result = HANDLER.set(&handler, || op(&handler));

  result.map_err(|_| {
    if handler.has_errors() {
      create_error_buffer(&wr, code, swap_byte_order)
    } else {
      panic!("Unexpected error in parse")
    }
  })
}

fn create_error_buffer(wr: &Writer, code: &str, swap_byte_order: bool) -> Vec<u8> {
  let mut lock = wr.0.lock();
  let error_buffer = take(&mut *lock);
  let pos = u32::from_ne_bytes(error_buffer[0..4].try_into().unwrap());
  get_parse_error_buffer(
    &error_buffer,
    &to_utf16_position(code, pos),
    swap_byte_order,
  )
}

pub(crate) fn get_nesting_error_buffer(
  code: &str,
  utf_8_pos: u32,
  message: &str,
  swap_byte_order: bool,
) -> Vec<u8> {
  let mut error_buffer = utf_8_pos.to_ne_bytes().to_vec();
  convert_string(&mut error_buffer, message);
  get_parse_error_buffer(
    &error_buffer,
    &to_utf16_position(code, utf_8_pos),
    swap_byte_order,
  )
}

fn to_utf16_position(code: &str, utf_8_pos: u32) -> u32 {
  let mut utf_16_pos: u32 = 0;
  for (position, character) in code.char_indices() {
    if (position as u32) == utf_8_pos {
      break;
    }
    utf_16_pos += character.len_utf16() as u32;
  }
  utf_16_pos
}
