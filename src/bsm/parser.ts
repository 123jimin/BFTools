import type { AST } from "./ast.ts";
import { tokenize } from "./token.ts";

export function parse(code: string): AST {
    const tokens = tokenize(code);
    console.log(tokens);
    throw new Error("Not yet implemented.");
}