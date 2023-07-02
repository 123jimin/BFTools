import type { AST, Loop } from "./ast.ts";
import { tokenize } from "./token.ts";

export class ParseError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

const encoder = new TextEncoder();

export function parse(code: string): AST {
    const tokens = tokenize(code);

    let curr_ast: AST[] = [];
    const stack: AST[][] = [];

    const pushAST = (ast: AST) => {
        curr_ast.push(ast);
    };

    const lookaheadLiteral = (i:number): [i: number, v: number[] | null] => {
        if(i+1 >= tokens.length) return [i, null];

        const next_token = tokens[i+1]!;

        if(typeof next_token === 'object') {
            switch(next_token.type) {
                case 'string': return [i+1, [...encoder.encode(next_token.value)]];
                case 'number': return[i+1, [next_token.value]];
            }
        }

        return [i, null];
    };

    for(let i=0; i<tokens.length; ++i) {
        const token = tokens[i];
        if(typeof token !== 'string') throw new ParseError("Invalid literal!");

        switch(token) {
            case 'loop': {
                if(tokens[++i] !== '{') {
                    throw new ParseError("Invalid loop!");
                }
                const inner_body: AST[] = [];
                const loop: Loop = {type: 'loop', body: inner_body };
                curr_ast.push(loop);
                stack.push(curr_ast);
                curr_ast = inner_body;
                break;
            }
            case '}':
                if (stack.length === 0) {
                    throw new ParseError("Unmatched closing block!");
                }
                curr_ast = stack.pop()!;
                break;
            case 'left':
            case 'right': {
                let amount = 1;

                const [ni, v] = lookaheadLiteral(i);
                if(v) {
                    if(v.length !== 1) throw new ParseError("Invalid literal!");
                    amount = v[0];
                }
                
                i = ni;

                if(token === 'left') amount *= -1;
                pushAST({type: 'cells', offset: amount});
                break;
            }
            case 'dec':
            case 'inc': {
                let amounts = [1];

                if(token === 'dec') {
                    for(let j=0; j<amounts.length; ++j) amounts[j] = -amounts[j];
                }

                break;
            }
            case 'set': {
                const [ni, v] = lookaheadLiteral(i);
                if(!v) throw new ParseError("Set values not specified!");

                pushAST({type: 'cells', sets: new Map(v.map((x, i) => [i, x])), offset: 0});

                i = ni;
                break;
            }
            case 'write':
                // TODO: support writing a string
                pushAST({type: 'write'});
                break;
            case 'read':
                pushAST({type: 'read'});
                break;
            case 'debug':
                pushAST({type: 'breakpoint'});
                break;
            default:
                throw new ParseError("Invalid token!");
        }
    }

    if(stack.length > 0) {
        throw new ParseError("Unmatched block!");
    }

    return curr_ast;
}