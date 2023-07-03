import type { AST, Cells, CellMergeable } from "./ast.ts";
import type { Statement, Literal } from "./grammar.d.ts";

import { mergeCells } from "./ast.ts";

// @deno-types="./grammar.d.ts"
import grammar from "./grammar.js";

const encoder = new TextEncoder();

const literalToIntList = (literal: Literal): number[] => {
    if(typeof literal === 'number') return [literal];
    if(typeof literal === 'string') return [...encoder.encode(literal)];

    return literal.map((v) => {
        if(typeof v !== 'number') throw new Error("Non-int lists are not supported!");
        return v;
    });
};

const tryMerge = (ast_list: AST[], elem: CellMergeable) => {
    const ast_last: Cells = (() => {
        if(ast_list.length > 0) {
            const last_ast = ast_list.at(-1)!;
            if((typeof last_ast === 'object') && 'type' in last_ast && last_ast.type === 'cells') return last_ast;
        }

        const new_cells: Cells = {type: 'cells', offset: 0};
        ast_list.push(new_cells);
        return new_cells;
    })();
    
    mergeCells(ast_last, elem);
}; 

function transformStatements(statements: Statement[]): AST[] {
    const ast_list: AST[] = [];

    for(const statement of statements) {
        switch(statement.type) {
            case 'left':
            case 'right':
                tryMerge(ast_list, {type: 'move', delta: (statement.type === 'left' ? -statement.delta : statement.delta)});
                break;
            case 'dec':
            case 'inc':
                tryMerge(ast_list, {type: 'cells', deltas: new Map(literalToIntList(statement.delta).map((x, i) => [i, (statement.type === 'dec' ? -x : x)])), offset: 0});
                break;
            case 'set': {
                const list = literalToIntList(statement.value);
                tryMerge(ast_list, {type: 'cells', clears: new Set(list.map((_, i) => i)), deltas: new Map(list.map((x, i) => [i, x])), offset: 0});
                break;
            }
            case 'read':
            case 'write':
                ast_list.push({type: statement.type});
                break;
            case 'debug':
                ast_list.push({type: 'breakpoint'});
                break;
            case 'loop':
                ast_list.push({type: 'loop', body: transformStatements(statement.body)});
                break;
        }
    }

    return ast_list;
}

export function parse(code: string): AST {
    return transformStatements(grammar.parse(code));
}