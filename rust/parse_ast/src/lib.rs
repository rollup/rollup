use std::panic::{catch_unwind, AssertUnwindSafe};

use swc_common::sync::Lrc;
use swc_common::{FileName, FilePathMapping, Globals, SourceMap, GLOBALS};
use swc_compiler_base::parse_js;
use swc_config::is_module::IsModule;
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{EsSyntax, Syntax};

use convert_ast::converter::AstConverter;
use error_emit::try_with_handler;

use crate::ast_nodes::panic_error::write_panic_error;
use crate::ast_nodes::parse_error::write_parse_error;
use crate::convert_ast::annotations::SequentialComments;

mod ast_nodes;
mod convert_ast;
mod error_emit;

pub fn parse_ast(
  code: String,
  allow_return_outside_function: bool,
  jsx: bool,
  walked_nodes_bitset_buffer: Option<&[u64]>,
) -> Vec<u8> {
  let walked_nodes_bitset: Option<[u64; 2]> = walked_nodes_bitset_buffer
    .map(|buffer| buffer.try_into().expect("bitset must have 2 elements"));

  let has_walking_info = walked_nodes_bitset.is_some();

  let cm = Lrc::new(SourceMap::new(FilePathMapping::empty()));
  let target = EsVersion::EsNext;
  let syntax = Syntax::Es(EsSyntax {
    allow_return_outside_function,
    import_attributes: true,
    explicit_resource_management: true,
    decorators: true,
    decorators_before_export: true,
    jsx,
    ..Default::default()
  });

  let filename = FileName::Anon;
  let file = cm.new_source_file(filename.into(), code);
  let code_reference = file.src.clone();
  let comments = SequentialComments::default();
  GLOBALS.set(&Globals::default(), || {
    let result = catch_unwind(AssertUnwindSafe(|| {
      // Create buffer upfront with size estimation and walking header if needed
      // This is just a wild guess and should be revisited from time to time
      let mut buffer = Vec::with_capacity(20 * code_reference.len());
      if has_walking_info {
        // Reserve 4 bytes at the start for the walking info offset
        buffer.extend_from_slice(&[0u8; 4]);
      }

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
        Err((utf_16_pos, message)) => {
          // Parse error case: write error to buffer
          write_parse_error(&mut buffer, utf_16_pos, &message);
          buffer
        }
        Ok(program) => {
          // Success case: use AstConverter to fill buffer
          let annotations = comments.take_annotations();
          let converter =
            AstConverter::new(buffer, &code_reference, &annotations, walked_nodes_bitset);
          converter.convert_ast_to_buffer(&program)
        }
      }
    }));
    result.unwrap_or_else(|err| {
      // Panic error case: create fresh buffer and write panic error
      let mut buffer = Vec::new();
      if has_walking_info {
        buffer.extend_from_slice(&[0u8; 4]);
      }
      let msg = if let Some(msg) = err.downcast_ref::<&str>() {
        msg
      } else if let Some(msg) = err.downcast_ref::<String>() {
        msg
      } else {
        "Unknown rust panic message"
      };
      write_panic_error(&mut buffer, msg);
      buffer
    })
  })
}
