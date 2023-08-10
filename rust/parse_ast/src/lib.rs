#![deny(clippy::all)]

use std::sync::Arc;

use swc::{config::ParseOptions, Compiler};
use swc_common::sync::Lrc;
use swc_common::{FileName, FilePathMapping, Globals, SourceMap, GLOBALS};
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{EsConfig, Syntax};

use convert_ast::converter::AstConverter;

mod convert_ast;

use error_emit::try_with_handler;

mod error_emit;

fn get_compiler() -> Arc<Compiler> {
  let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));
  Arc::new(Compiler::new(cm))
}

pub fn parse_ast(code: String) -> Vec<u8> {
  let compiler = get_compiler();
  let compiler_options = ParseOptions {
    syntax: Syntax::Es(EsConfig {
      import_assertions: true,
      ..Default::default()
    }),
    target: EsVersion::EsNext,
    ..Default::default()
  };
  let filename = FileName::Anon;
  let file = compiler.cm.new_source_file(filename, code);
  let code_reference = Lrc::clone(&file.src);
  GLOBALS.set(&Globals::default(), || {
    compiler.run(|| {
      let result = try_with_handler(compiler.cm.clone(), |handler| {
        compiler.parse_js(
          file,
          handler,
          compiler_options.target,
          compiler_options.syntax,
          compiler_options.is_module,
          None,
        )
      });
      match result {
        Err(buffer) => buffer,
        Ok(program) => {
          let converter = AstConverter::new(&code_reference);
          let buffer = converter.convert_ast_to_buffer(&program);
          buffer
        }
      }
    })
  })
}
