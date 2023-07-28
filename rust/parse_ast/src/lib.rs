#![deny(clippy::all)]

use std::sync::Arc;

use anyhow::anyhow;
use swc::{config::ParseOptions, Compiler};
use swc_common::sync::Lrc;
use swc_common::{
  errors::{DiagnosticBuilder, Emitter, Handler},
  FileName, FilePathMapping, Globals, SourceMap, GLOBALS,
};
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{EsConfig, Syntax};

use wasm_bindgen::prelude::*;

use convert_ast::converter::AstConverter;

mod convert_ast;

fn get_compiler() -> Arc<Compiler> {
  let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));
  Arc::new(Compiler::new(cm))
}

struct TestEmitter {}

impl Emitter for TestEmitter {
  fn emit(&mut self, db: &DiagnosticBuilder<'_>) {
    dbg!(db);
  }
}

#[wasm_bindgen]
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
  let emitter = TestEmitter {};
  let handler = Handler::with_emitter(true, false, Box::new(emitter));
  GLOBALS.set(&Globals::default(), || {
    compiler
      .run(|| {
        // let swc_start = Instant::now();
        let file = compiler.cm.new_source_file(filename, code);
        let code_reference = Lrc::clone(&file.src);
        let comments = None;
        let program = compiler.parse_js(
          file,
          &handler,
          compiler_options.target,
          compiler_options.syntax,
          compiler_options.is_module,
          comments,
        )?;
        if handler.has_errors() {
          Err(anyhow!("failed to parse"))
        } else {
          let converter = AstConverter::new(&code_reference);
          let buffer = converter.convert_ast_to_buffer(&program);
          Ok(buffer)
        }
      })
      .expect("failed to parse")
  })
}
