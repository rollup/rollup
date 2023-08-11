use std::mem;
use std::slice::Iter;
use std::str::Chars;

use swc_common::comments::Comment;

#[derive(Debug)]
pub struct Utf8ToUtf16ByteIndexConverterAndAnnotationHandler<'a> {
  current_utf8_index: u32,
  current_utf16_index: u32,
  character_iterator: Chars<'a>,
  next_annotation: Option<&'a Comment>,
  annotation_iterator: Iter<'a, Comment>,
  collected_annotations: Vec<ConvertedAnnotation>,
  invalid_annotations: Vec<ConvertedAnnotation>,
}

#[derive(Debug)]
pub struct ConvertedAnnotation {
  pub start: u32,
  pub end: u32,
}

impl<'a> Utf8ToUtf16ByteIndexConverterAndAnnotationHandler<'a> {
  pub fn new(code: &'a str, annotations: &'a Vec<Comment>) -> Self {
    let mut annotation_iterator = annotations.iter();
    let current_annotation = annotation_iterator.next();
    Self {
      current_utf8_index: 0,
      current_utf16_index: 0,
      character_iterator: code.chars(),
      next_annotation: current_annotation,
      annotation_iterator,
      collected_annotations: Vec::new(),
      invalid_annotations: Vec::with_capacity(annotations.len()),
    }
  }

  pub fn convert(&mut self, utf8_index: u32) -> u32 {
    self
      .invalid_annotations
      .extend(self.collected_annotations.drain(..));
    self.convert_position_and_handle_annotations(utf8_index, None);
    self.current_utf16_index
  }

  pub fn convert_and_get_annotations(
    &mut self,
    utf8_index: u32,
  ) -> (u32, Vec<ConvertedAnnotation>) {
    let mut annotations = mem::replace(&mut self.collected_annotations, Vec::new());
    self.convert_position_and_handle_annotations(utf8_index, Some(&mut annotations));
    (self.current_utf16_index, annotations)
  }

  pub fn convert_and_leave_annotations(&mut self, utf8_index: u32) -> u32 {
    let mut annotations = Vec::new();
    self.convert_position_and_handle_annotations(utf8_index, Some(&mut annotations));
    self.collected_annotations.extend(annotations);
    self.current_utf16_index
  }

  pub fn take_invalid_annotations(&mut self) -> Vec<ConvertedAnnotation> {
    let invalid_annotations = mem::replace(&mut self.invalid_annotations, Vec::new());
    invalid_annotations
  }

  #[inline(always)]
  fn convert_position_and_handle_annotations(
    &mut self,
    utf8_index: u32,
    annotation_collection: Option<&mut Vec<ConvertedAnnotation>>,
  ) {
    if self.current_utf8_index > utf8_index {
      panic!(
        "Cannot convert positions backwards: {} < {}",
        utf8_index, self.current_utf8_index
      );
    }
    let mut next_annotation_start = self
      .next_annotation
      .map(|a| a.span.lo.0 - 1)
      .unwrap_or(u32::MAX);
    let annotations = match annotation_collection {
      None => &mut self.invalid_annotations,
      Some(annotations) => annotations,
    };
    while self.current_utf8_index < utf8_index {
      if self.current_utf8_index == next_annotation_start {
        let start = self.current_utf16_index;
        let next_annotation_end = self.next_annotation.map(|a| a.span.hi.0 - 1).unwrap();
        while self.current_utf8_index < next_annotation_end {
          let character = self.character_iterator.next().unwrap();
          self.current_utf8_index += character.len_utf8() as u32;
          self.current_utf16_index += character.len_utf16() as u32;
        }
        annotations.push(ConvertedAnnotation {
          start,
          end: self.current_utf16_index,
        });
        self.next_annotation = self.annotation_iterator.next();
        next_annotation_start = self
          .next_annotation
          .map(|a| a.span.lo.0 - 1)
          .unwrap_or(u32::MAX);
      } else {
        let character = self.character_iterator.next().unwrap();
        self.current_utf8_index += character.len_utf8() as u32;
        self.current_utf16_index += character.len_utf16() as u32;
      }
    }
  }
}
