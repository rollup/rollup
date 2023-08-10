// some code copied from swc_error_reporters/src/handler.rs

use std::{fmt, io::Write, mem::take, sync::Arc};

use anyhow::Error;
use parking_lot::Mutex;
use swc_common::{errors::Handler, sync::Lrc, SourceMap};
use swc_error_reporters::PrettyEmitter;

use crate::convert_ast::converter::node_types::TYPE_PARSE_ERROR;

#[derive(Clone, Default)]
struct LockedWriter(Arc<Mutex<Vec<u8>>>);

impl Write for LockedWriter {
  fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
    let mut lock = self.0.lock();

    lock.extend_from_slice(buf);

    Ok(buf.len())
  }

  fn flush(&mut self) -> std::io::Result<()> {
    Ok(())
  }
}

impl fmt::Write for LockedWriter {
  fn write_str(&mut self, s: &str) -> fmt::Result {
    self.write(s.as_bytes()).map_err(|_| fmt::Error)?;

    Ok(())
  }
}

pub fn try_with_handler<F, Ret>(cm: Lrc<SourceMap>, op: F) -> Result<Ret, Vec<u8>>
where
  F: FnOnce(&Handler) -> Result<Ret, Error>,
{
  let wr = Box::<LockedWriter>::default();

  let emitter = PrettyEmitter::new(cm, wr.clone(), Default::default(), Default::default());

  let handler = Handler::with_emitter(true, false, Box::new(emitter));

  let result = op(&handler);

  match result {
    Ok(r) => Ok(r),
    Err(err) => {
      let mut buffer = TYPE_PARSE_ERROR.to_vec();
      if handler.has_errors() {
        let mut lock = wr.0.lock();
        buffer.extend_from_slice(&take(&mut *lock));
      } else {
        buffer.extend_from_slice(&err.to_string().as_bytes().to_vec());
      }
      Err(buffer)
    }
  }
}
