import type { AST } from "./ast.ts";

export interface ParseOption {
    /** Whether to include breakpoints(#). Defaults to `true`. */
    include_breakpoints: boolean;
}

export class ParseError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export function parse(code: string, option?: Partial<ParseOption>): AST {
    let curr_ast: AST[] = [];
    const ast_stack: AST[][] = [];

    const tokenizer = (option?.include_breakpoints ?? true) ? /(\++|\-+|<+|>+|[.,\[\]#])/g : /(\++|\-+|<+|>+|[.,\[\]])/g;

    for(const token of code.match(tokenizer) ?? []) {
        switch(token[0]) {
            case '>':
                curr_ast.push({type: 'move', delta: token.length});
                break;
            case '<':
                curr_ast.push({type: 'move', delta: -token.length});
                break;
            case '+':
                curr_ast.push({type: 'cell', delta: token.length});
                break;
            case '-':
                curr_ast.push({type: 'cell', delta: -token.length});
                break;
            case '[': {
                const loop_body: AST[] = [];
                curr_ast.push({type: 'loop', body: loop_body});
                ast_stack.push(curr_ast);
                curr_ast = loop_body;
                break;
            }
            case ']': {
                const top = ast_stack.pop();
                if(top) {
                    curr_ast = top;
                } else {
                    throw new ParseError("Unmatched loop end");
                }
                break;
            }
            case '.':
                curr_ast.push({type: 'write'});
                break;
            case ',':
                curr_ast.push({type: 'read'});
                break;
            case '#':
                curr_ast.push({type: 'breakpoint'});
                break;
        }
    }

    if(ast_stack.length) {
        throw new ParseError("Unmatched loop start");
    }

    return curr_ast;
}