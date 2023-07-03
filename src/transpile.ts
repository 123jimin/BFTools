import type {AST as BF_AST} from "./bf/index.ts";
import type {AST as BSM_AST} from "./bsm/index.ts";

export function bsm2bf(bsm_ast: BSM_AST): BF_AST {
    if(Array.isArray(bsm_ast)) {
        return bsm_ast.map((child) => bsm2bf(child));
    }

    switch(bsm_ast.type) {
        case 'cells': {
            // TODO: optimize
            const bf_ast: BF_AST[] = [];
            let curr_offset = 0;

            if(bsm_ast.clears) {
                for(const offset of bsm_ast.clears) {
                    if(curr_offset !== offset) {
                        bf_ast.push({type: 'move', delta: offset - curr_offset});
                        curr_offset = offset;
                    }

                    bf_ast.push({type: 'loop', body: {type: 'cell', delta: -1}});
                }
            }

            if(bsm_ast.deltas) {
                for(const [offset, delta] of bsm_ast.deltas.entries()) {
                    if(curr_offset !== offset) {
                        bf_ast.push({type: 'move', delta: offset - curr_offset});
                        curr_offset = offset;
                    }

                    if(delta) bf_ast.push({type: 'cell', delta: delta});
                }
            }

            if(curr_offset !== bsm_ast.offset) {
                bf_ast.push({type: 'move', delta: bsm_ast.offset - curr_offset});
            }

            return bf_ast;
        }
        case 'loop':
            return {type: 'loop', body: bsm2bf(bsm_ast.body)};
        default:
            return bsm_ast;
    }
}