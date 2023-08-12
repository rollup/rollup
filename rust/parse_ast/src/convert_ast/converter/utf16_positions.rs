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
  next_annotation_start: u32,
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
      next_annotation_start: get_annotation_start(current_annotation),
      annotation_iterator,
      collected_annotations: Vec::new(),
      invalid_annotations: Vec::with_capacity(annotations.len()),
    }
  }

  /// Converts the given UTF-8 byte index to a UTF-16 byte index.
  ///
  /// To be performant, this method assumes that the given index is not smaller
  /// than the previous index. Additionally, it handles "annotations" like
  /// `@__PURE__` comments in the process.
  ///
  /// The logic for those comments is as follows:
  /// - If the current index is at the start of an annotation, the annotation
  ///   is collected and the index is advanced to the end of the annotation.
  /// - Otherwise, we check if the next character is either a white-space
  ///   character or a `(`. Otherwise, we invalidate all collected annotations.
  ///   This is to ensure that we only collect annotations that directly precede
  ///   an expression and are not e.g. separated by a comma.
  /// - If annotations are relevant for an expression, it can "take" the
  ///   collected annotations by calling `take_collected_annotations`. This
  ///   clears the internal buffer and returns the collected annotations.
  /// - Invalidated annotations are attached to the Program node so that they
  ///   can all be removed from the source code later.
  pub fn convert(&mut self, utf8_index: u32) -> u32 {
    if self.current_utf8_index > utf8_index {
      panic!(
        "Cannot convert positions backwards: {} < {}",
        utf8_index, self.current_utf8_index
      );
    }
    while self.current_utf8_index < utf8_index {
      if self.current_utf8_index == self.next_annotation_start {
        let start = self.current_utf16_index;
        let next_annotation_end = self.next_annotation.map(|a| a.span.hi.0 - 1).unwrap();
        while self.current_utf8_index < next_annotation_end {
          let character = self.character_iterator.next().unwrap();
          self.current_utf8_index += character.len_utf8() as u32;
          self.current_utf16_index += character.len_utf16() as u32;
        }
        self.collected_annotations.push(ConvertedAnnotation {
          start,
          end: self.current_utf16_index,
        });
        self.next_annotation = self.annotation_iterator.next();
        self.next_annotation_start = get_annotation_start(self.next_annotation);
      } else {
        let character = self.character_iterator.next().unwrap();
        if !self.collected_annotations.is_empty() {
          match character {
            ' ' | '\t' | '\r' | '\n' | '(' => {}
            _ => {
              self.invalidate_collected_annotations();
            }
          }
        }
        self.current_utf8_index += character.len_utf8() as u32;
        self.current_utf16_index += character.len_utf16() as u32;
      }
    }
    self.current_utf16_index
  }

  pub fn take_collected_annotations(&mut self) -> Vec<ConvertedAnnotation> {
    mem::replace(&mut self.collected_annotations, Vec::new())
  }

  pub fn invalidate_collected_annotations(&mut self) {
    self
      .invalid_annotations
      .extend(self.collected_annotations.drain(..));
  }

  pub fn take_invalid_annotations(&mut self) -> Vec<ConvertedAnnotation> {
    let invalid_annotations = mem::replace(&mut self.invalid_annotations, Vec::new());
    invalid_annotations
  }
}

fn get_annotation_start(annotation: Option<&Comment>) -> u32 {
  annotation.map(|a| a.span.lo.0 - 1).unwrap_or(u32::MAX)
}
