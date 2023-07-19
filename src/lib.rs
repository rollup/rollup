#![deny(clippy::all)]

use std::sync::Arc;

use anyhow::anyhow;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use swc::{config::ParseOptions, Compiler};
use swc_common::{
  errors::{DiagnosticBuilder, Emitter, Handler},
  FileName, FilePathMapping, Globals, SourceMap, GLOBALS,
};
// use std::time::{Instant};
use swc_common::sync::Lrc;
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::{EsConfig, Syntax};

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

#[napi]
pub fn parse(code: String) -> Buffer {
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
        // println!("swc parse took {:?}", swc_start.elapsed());
        if handler.has_errors() {
          Err(anyhow!("failed to parse"))
        } else {
          // let converter_start = Instant::now();
          let converter = AstConverter::new(code_reference.as_bytes());
          let buffer = converter.convert_ast_to_buffer(&program);
          // println!("converter took {:?}", converter_start.elapsed());
          Ok(buffer)
        }
      })
      .expect("failed to parse")
  })
}
