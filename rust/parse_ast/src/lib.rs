use std::panic::{catch_unwind, AssertUnwindSafe};

use convert_ast::converter::ast_constants::{
  PANIC_ERROR_RESERVED_BYTES, TYPE_PANIC_ERROR_INLINED_MESSAGE,
};
use convert_ast::converter::{convert_string, AstConverter};
use swc_common::sync::Lrc;
use swc_common::{FileName, FilePathMapping, Globals, SourceMap, GLOBALS};
use swc_compiler_base::parse_js;
use swc_compiler_base::IsModule;
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{EsConfig, Syntax};

use crate::convert_ast::annotations::SequentialComments;

mod convert_ast;

use error_emit::try_with_handler;

mod error_emit;

pub fn parse_ast(code: String, allow_return_outside_function: bool) -> Vec<u8> {
  let cm = Lrc::new(SourceMap::new(FilePathMapping::empty()));
  let target = EsVersion::EsNext;
  let syntax = Syntax::Es(EsConfig {
    allow_return_outside_function,
    import_attributes: true,
    explicit_resource_management: true,
    ..Default::default()
  });

  let filename = FileName::Anon;
  let file = cm.new_source_file(filename, code);
  let code_reference = Lrc::clone(&file.src);
  let comments = SequentialComments::default();
  GLOBALS.set(&Globals::default(), || {
    let result = catch_unwind(AssertUnwindSafe(|| {
      let result = try_with_handler(&code_reference, |handler| {
        parse_js(
          cm,
          file,
          handler,
          target,
          syntax,
          IsModule::Unknown,
          Some(&comments),
        )
      });
      match result {
        Err(buffer) => buffer,
        Ok(program) => {
          let annotations = comments.take_annotations();
          let converter = AstConverter::new(&code_reference, &annotations);
          converter.convert_ast_to_buffer(&program)
        }
      }
    }));
    result.unwrap_or_else(|err| {
      let msg = if let Some(msg) = err.downcast_ref::<&str>() {
        msg
      } else if let Some(msg) = err.downcast_ref::<String>() {
        msg
      } else {
        "Unknown rust panic message"
      };
      let mut buffer = TYPE_PANIC_ERROR_INLINED_MESSAGE.to_vec();
      // reserve for start and end even though they are unused
      buffer.resize(buffer.len() + 4 + PANIC_ERROR_RESERVED_BYTES, 0);
      convert_string(&mut buffer, msg);
      buffer
    })
  })
}
