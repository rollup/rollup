use std::{mem::take, sync::Arc};

use anyhow::Error;
use parking_lot::Mutex;
use swc_common::errors::{DiagnosticBuilder, Emitter, Handler, Level, HANDLER};
use swc_ecma_ast::Program;

#[derive(Clone, Default)]
struct ErrorData(Arc<Mutex<Option<(u32, String)>>>);

pub(crate) struct ErrorEmitter {
  error_data: ErrorData,
}

impl Emitter for ErrorEmitter {
  fn emit(&mut self, db: &mut DiagnosticBuilder<'_>) {
    if db.level == Level::Error {
      let mut pos: u32 = 0;
      if let Some(span) = db.span.primary_span() {
        pos = span.lo.0 - 1;
      };
      let message = db.message[0].0.to_string();
      *self.error_data.0.lock() = Some((pos, message));
    }
  }
}

pub(crate) fn try_with_handler<F>(code: &str, op: F) -> Result<Program, (u32, String)>
where
  F: FnOnce(&Handler) -> Result<Program, Error>,
{
  let error_data = ErrorData::default();

  let emitter = ErrorEmitter {
    error_data: error_data.clone(),
  };

  let handler = Handler::with_emitter(true, false, Box::new(emitter));

  let result = HANDLER.set(&handler, || op(&handler));

  result.map_err(|_| {
    if handler.has_errors() {
      extract_error_data(&error_data, code)
    } else {
      panic!("Unexpected error in parse")
    }
  })
}

fn extract_error_data(error_data: &ErrorData, code: &str) -> (u32, String) {
  let mut lock = error_data.0.lock();
  let (utf8_pos, message) = take(&mut *lock).expect("Error data should be set");

  // Convert utf-8 position to utf-16
  let mut utf_16_pos: u32 = 0;
  for (utf_8_pos, char) in code.char_indices() {
    if (utf_8_pos as u32) == utf8_pos {
      break;
    }
    utf_16_pos += char.len_utf16() as u32;
  }

  (utf_16_pos, message)
}
