use std::panic::{AssertUnwindSafe, catch_unwind};

use swc_common::{FileName, FilePathMapping, Globals, GLOBALS, SourceMap};
use swc_common::sync::Lrc;
use swc_compiler_base::IsModule;
use swc_compiler_base::parse_js;
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{EsConfig, Syntax, TsConfig};

use crate::ast_nodes::panic_error::get_panic_error_buffer;
use convert_ast::converter::AstConverter;
use error_emit::try_with_handler;

use crate::convert_ast::annotations::SequentialComments;

mod ast_nodes;
mod convert_ast;
mod error_emit;

pub fn parse_ast(code: String, allow_return_outside_function: bool, preserve_typescript: bool) -> Vec<u8> {
  let cm = Lrc::new(SourceMap::new(FilePathMapping::empty()));
  let target = EsVersion::EsNext;
  let syntax= if true {
    Syntax::Typescript(TsConfig {
      tsx: false,
      decorators: false,
      dts: false,
      no_early_errors: false,
      ..Default::default()
    })
  } else {
    Syntax::Es(EsConfig {
      allow_return_outside_function,
      import_attributes: true,
      explicit_resource_management: true,..Default::default()
    })
  };

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
      get_panic_error_buffer(msg)
    })
  })
}
