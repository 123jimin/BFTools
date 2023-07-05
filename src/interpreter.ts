import { AST as BFAST } from "./bf/index.ts";
import { AST as BSMAST} from "./bsm/index.ts";

export interface InterpreterOption {
    init_buffer_size: number;
    max_buffer_size: number|null;

    read: () => Promise<number>;
    break: () => Promise<void>;
    write: (ch: number) => void;
}

export class Interpreter {
    pointer = 0;
    buffer: Uint8Array;

    option: InterpreterOption;

    constructor(option?: Partial<InterpreterOption>) {

        this.option = {
            init_buffer_size: 1024,
            max_buffer_size: null,
            read: async () => 42,
            // deno-lint-ignore require-await
            break: async () => void 0,
            write: (ch: number) => {},
            ...option
        };

        this.buffer = new Uint8Array(this.option.init_buffer_size);
    }

    private _tryExtend(): void {
        if(this.pointer < 0) throw new Error("Invalid pointer location!");
        if(this.pointer < this.buffer.length) return;
        if(this.option.max_buffer_size != null && this.pointer >= this.option.max_buffer_size) throw new Error("Invalid pointer location!");
        
        // TODO
        throw new Error("Not yet implemented!");
    }

    async run(ast: BFAST|BSMAST): Promise<void> {
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
            case 'cell':
                this._tryExtend();
                this.buffer[this.pointer] += ast.delta;
                break;
            case 'cells': {
                const base = this.pointer;
                
                if(ast.clears) {
                    for(const offset of ast.clears) {
                        this.pointer = base + offset;
                        this._tryExtend();
                        this.buffer[this.pointer] = 0;
                    }
                }

                if(ast.deltas) {
                    for(const [offset, value] of ast.deltas) {
                        this.pointer = base + offset;
                        this._tryExtend();
                        this.buffer[this.pointer] += value;
                    }
                }

                this.pointer = ast.offset + base;
                break;
            }
            case 'read':
                this._tryExtend();
                this.buffer[this.pointer] = await this.option.read();
                break;
            case 'write':
                this._tryExtend();
                this.option.write(this.buffer[this.pointer]);
                break;
            case 'breakpoint':
                await this.option.break();
                break;
            case 'loop':
                await this.run(ast.body);
                break;
        }
    }
}