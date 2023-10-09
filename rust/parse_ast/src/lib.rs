#![feature(ptr_internals)]
use std::sync::Arc;

use convert_ast::converter::AstConverter;
use swc::config::IsModule::Unknown;
use swc::{config::ParseOptions, Compiler};
use swc_common::sync::Lrc;
use swc_common::{FileName, FilePathMapping, Globals, SourceMap, GLOBALS};
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{EsConfig, Syntax};

use crate::convert_ast::annotations::SequentialComments;

mod convert_ast;

use error_emit::try_with_handler;

mod error_emit;

fn get_compiler() -> Arc<Compiler> {
  let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));
  Arc::new(Compiler::new(cm))
}

pub fn parse_ast(code: String, allow_return_outside_function: bool) -> Vec<u8> {
  let compiler = get_compiler();
  let compiler_options = ParseOptions {
    syntax: Syntax::Es(EsConfig {
      allow_return_outside_function,
      import_attributes: true,
      ..Default::default()
    }),
    target: EsVersion::EsNext,
    is_module: Unknown,
    comments: false,
  };
  let filename = FileName::Anon;
  let file = compiler.cm.new_source_file(filename, code);
  let code_reference = Lrc::clone(&file.src);
  let comments = SequentialComments::default();
  GLOBALS.set(&Globals::default(), || {
    compiler.run(|| {
      let result = try_with_handler(
        &code_reference,
        &compiler.cm,
        compiler_options.target,
        |handler| {
          compiler.parse_js(
            file,
            handler,
            compiler_options.target,
            compiler_options.syntax,
            compiler_options.is_module,
            Some(&comments),
          )
        },
      );
      match result {
        Err(buffer) => buffer,
        Ok(program) => {
          let annotations = comments.take_annotations();
          let converter = AstConverter::new(&code_reference, &annotations);
          converter.convert_ast_to_buffer(&program)
        }
      }
    })
  })
}
