use std::panic::{catch_unwind, AssertUnwindSafe};

use anyhow::anyhow;
use swc_common::comments::Comments;
use swc_common::errors::Handler;
use swc_common::input::SourceFileInput;
use swc_common::sync::Lrc;
use swc_common::{FileName, FilePathMapping, Globals, SourceFile, SourceMap, GLOBALS};
use swc_ecma_ast::{EsVersion, Program};
use swc_ecma_parser::error::Error as ParserError;
use swc_ecma_parser::{EsSyntax, Lexer, Parser, Syntax};

use convert_ast::converter::{AstConverter, NestingError};
use error_emit::{get_nesting_error_buffer, try_with_handler};
use nesting_limit::{GuardedTokens, NestingGuard, DEPTH_LIMIT_MESSAGE, STACK_EXHAUSTED_MESSAGE};

use crate::ast_nodes::panic_error::get_panic_error_buffer;
use crate::convert_ast::annotations::SequentialComments;

mod ast_nodes;
mod convert_ast;
mod error_emit;
mod nesting_limit;

/// With `swap_byte_order`, the 32-bit fields of the buffer are written in the opposite of the
/// native byte order. The WASM build, whose byte order is always little-endian, uses this on
/// big-endian hosts because the JS side reads the buffer in the byte order of the host. Strings and
/// the f64 values, which are always little-endian, are not affected.
pub fn parse_ast(
  code: String,
  allow_return_outside_function: bool,
  jsx: bool,
  swap_byte_order: bool,
) -> Vec<u8> {
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
    let nesting_guard = NestingGuard::new();
    let result = catch_unwind(AssertUnwindSafe(|| {
      let parse_result = try_with_handler(&code_reference, swap_byte_order, |handler| {
        parse_program(&file, handler, target, syntax, &comments, &nesting_guard)
      });
      match (parse_result, nesting_guard.exceeded_position()) {
        (_, Some(position)) => get_nesting_error_buffer(
          &code_reference,
          position,
          STACK_EXHAUSTED_MESSAGE,
          swap_byte_order,
        ),
        (Err(buffer), None) => buffer,
        (Ok(program), None) => {
          let annotations = comments.take_annotations();
          let converter = AstConverter::new(&code_reference, &annotations, swap_byte_order);
          match converter.convert_ast_to_buffer(&program) {
            Ok(buffer) => buffer,
            Err(nesting_error) => {
              // Dropping a deeply nested syntax tree recurses as well and would exhaust the
              // stack after the conversion was rejected.
              std::mem::forget(program);
              let (position, message) = match nesting_error {
                NestingError::DepthLimit { utf_8_position } => {
                  (utf_8_position, DEPTH_LIMIT_MESSAGE)
                }
                NestingError::StackExhausted { utf_8_position } => {
                  (utf_8_position, STACK_EXHAUSTED_MESSAGE)
                }
              };
              get_nesting_error_buffer(&code_reference, position, message, swap_byte_order)
            }
          }
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
      get_panic_error_buffer(msg, swap_byte_order)
    })
  })
}

fn parse_program(
  file: &SourceFile,
  handler: &Handler,
  target: EsVersion,
  syntax: Syntax,
  comments: &dyn Comments,
  nesting_guard: &NestingGuard,
) -> anyhow::Result<Program> {
  let lexer = Lexer::new(syntax, target, SourceFileInput::from(file), Some(comments));
  let mut parser = Parser::new_from(GuardedTokens::new(lexer, nesting_guard.clone()));
  let program_result = parser.parse_program();
  let recovered_errors: Vec<ParserError> = parser.take_errors();
  let has_recovered_errors = !recovered_errors.is_empty();
  for error in recovered_errors {
    error.into_diagnostic(handler).emit();
  }
  let program = program_result.map_err(|error| {
    error.into_diagnostic(handler).emit();
    anyhow!("Syntax Error")
  })?;
  if has_recovered_errors {
    return Err(anyhow!("Syntax Error"));
  }
  Ok(program)
}
