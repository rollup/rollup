#![deny(clippy::all)]

use std::sync::Arc;

use anyhow::anyhow;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use swc::{Compiler, config::ParseOptions};
use swc_common::{errors::{DiagnosticBuilder, Emitter, Handler}, FileName, FilePathMapping, GLOBALS, Globals, SourceMap, sync::Lazy};

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
    let compiler_options = ParseOptions::default();
    let filename = FileName::Anon;
    let emitter = TestEmitter {};
    let handler = Handler::with_emitter(true, false, Box::new(emitter));
    GLOBALS.set(&Globals::default(), || {
        compiler.run(|| {
            let code_length = code.len() as u32;
            let file = compiler.cm.new_source_file(filename, code);
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
                let converter = AstConverter::new();
                let buffer = converter.convert_ast_to_buffer(&program, code_length);
                Ok(buffer)
            }
        }).expect("failed to parse")
    })
}
