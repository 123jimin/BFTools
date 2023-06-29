/**
 * Library for parsing and emitting BF codes.
 * Other than RLE, this module does not perform any optimization.
 */

export type { AST } from "./ast.ts";
export { toBFCode } from "./ast.ts";
export { parse } from "./parser.ts";