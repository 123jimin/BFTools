import { AST as BFAST } from "./bf/index.ts";
import { AST as BSMAST} from "./bsm/index.ts";

export interface InterpreterOption {
    cell_size: number;
}

export class Interpreter {
    pointer: number = 0;

    constructor(option?: Partial<InterpreterOption>) {

    }

    run(ast: BFAST|BSMAST): void {
        if(Array.isArray(ast)) {
            for(const child of ast) {
                this.run(child);
            }
            return;
        }

        switch(ast.type) {
            case 'move':
                this.pointer += ast.delta;
                break;
        }
    }
}