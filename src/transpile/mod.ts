import type {AST as BF_AST} from "../bf/mod.ts";
import type {AST as BSM_AST, Cells as BSM_Cells} from "../bsm/mod.ts";

function bfSpread(pivot_offset: number, spread_offset: [offset: number, amount: number][]): BF_AST[] {
    const code: BF_AST = [];

    if(pivot_offset) code.push({type: 'move', delta: pivot_offset});
    
    const loop: BF_AST = [{type: 'cell', delta: -1}];
    let curr_offset = pivot_offset;

    for(const [offset, amount] of spread_offset) {
        if(curr_offset !== offset) {
            loop.push({type: 'move', delta: offset - curr_offset});
            curr_offset = offset;
        }

        if(amount) loop.push({type: 'cell', delta: amount});
    }

    if(curr_offset !== pivot_offset) {
        loop.push({type: 'move', delta: pivot_offset - curr_offset});
    }

    code.push({type: 'loop', body: loop});

    return code;
}

function cells2bf(cells: BSM_Cells): BF_AST[] {
    const bf_ast: BF_AST[] = [];
    let curr_offset = 0;

    if(cells.clears?.size) {
        const clears = [...cells.clears].sort((x, y) => x - y);
        let pivot_offset = clears[0];
        let pivot_delta_abs = cells.deltas?.get(pivot_offset) ?? 0;
        if(pivot_delta_abs < 0) pivot_delta_abs = -pivot_delta_abs;

        for(const offset of clears) {
            if(curr_offset !== offset) {
                bf_ast.push({type: 'move', delta: offset - curr_offset});
                curr_offset = offset;
            }

            bf_ast.push({type: 'loop', body: {type: 'cell', delta: -1}});

            let curr_delta_abs = cells.deltas?.get(offset) ?? 0;
            if(curr_delta_abs < 0) curr_delta_abs = -curr_delta_abs;

            if(curr_delta_abs <= pivot_delta_abs) {
                pivot_offset = offset;
                pivot_delta_abs = curr_delta_abs;
            }
        }

        if(curr_offset !== pivot_offset) {
            bf_ast.push({type: 'move', delta: pivot_offset - curr_offset});
            curr_offset = pivot_offset;
        }

        if(cells.deltas?.size) {
            const deltas = [...cells.deltas.entries()].filter((x) => x[1]).sort((x, y) => x[0]-y[0]);
            const spreads = deltas.map<[number ,number]>(([offset, delta]) => [offset - pivot_offset, Math.trunc(delta / 8)]).filter((x) => x[1]);

            if(spreads.length) {
                bf_ast.push({type: 'cell', delta: 8});
                bf_ast.push(...bfSpread(0, spreads));
            }

            for(const [offset, delta] of deltas) {
                const remainder = offset === pivot_offset ? delta : delta - 8 * Math.trunc(delta / 8);
                if(remainder === 0) continue;

                if(curr_offset !== offset) {
                    bf_ast.push({type: 'move', delta: offset - curr_offset});
                    curr_offset = offset;
                }
                bf_ast.push({type: 'cell', delta: remainder});
            }
        }

    } else {
        if(cells.deltas) {
            for(const [offset, delta] of cells.deltas.entries()) {
                if(curr_offset !== offset) {
                    bf_ast.push({type: 'move', delta: offset - curr_offset});
                    curr_offset = offset;
                }
    
                if(delta) bf_ast.push({type: 'cell', delta: delta});
            }
        }
    }

    if(curr_offset !== cells.offset) {
        bf_ast.push({type: 'move', delta: cells.offset - curr_offset});
    }

    return bf_ast;
}

export function bsm2bf(bsm_ast: BSM_AST): BF_AST {
    if(Array.isArray(bsm_ast)) {
        return bsm_ast.map((child) => bsm2bf(child));
    }

    switch(bsm_ast.type) {
        case 'cells':
            return cells2bf(bsm_ast);
        case 'loop':
            return {type: 'loop', body: bsm2bf(bsm_ast.body)};
        default:
            return bsm_ast;
    }
}