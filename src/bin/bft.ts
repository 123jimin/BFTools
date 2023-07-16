import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";
import type { Arguments } from "https://deno.land/x/yargs@v17.7.2-deno/deno-types.ts";

import * as bf from "../bf/index.ts";
import * as bsm from "../bsm/index.ts";
import * as transpile from "../transpile.ts";
import * as interpreter from "../interpreter.ts";

interface CompilerProgramParam {
    file: string;
}

class CompileProgram {
    param: CompilerProgramParam;    
    constructor(param: CompilerProgramParam) {
        this.param = param;
    }

    async run(): Promise<void> {
        const bsm_code = await Deno.readTextFile(this.param.file);
        const bsm_ast = bsm.parse(bsm_code);
        const bs_ast = transpile.bsm2bf(bsm_ast);
        const bs_code = bf.toBFCode(bs_ast);

        console.log(bs_code);
    }
}

interface ExecuteProgramParam {
    file: string;
}

class ExecuteProgram {
    param: ExecuteProgramParam;
    constructor(param: ExecuteProgramParam) {
        this.param = param;
    }

    async run(): Promise<void> {
        const bsm_code = await Deno.readTextFile(this.param.file);
        const bsm_ast = bsm.parse(bsm_code);

        const deno_io = new interpreter.DenoIO(Deno.stdin, Deno.stdout);
        const runner = new interpreter.Interpreter({
            read: deno_io.read.bind(deno_io),
            write: deno_io.write.bind(deno_io),
        });

        await runner.run(bsm_ast);
    }
}

yargs(Deno.args)
    .command("compile <file>", "compiles a given BSM file to BF", (yargs: any) => {
        return yargs.positional('file', {
            describe: "a BSM file to be compiled",
            type: 'string',
        });
    }, (argv: Arguments) => {
        const program = new CompileProgram(argv as unknown as CompilerProgramParam);
        program.run().catch((e) => console.error(e));
    })
    .command("run <file>", "executes a given BSM file", (yargs: any) => {
        return yargs.positional('file', {
            describe: "a BSM file to be executed",
            type: 'string',
        });
    }, (argv: Arguments) => {
        const program = new ExecuteProgram(argv as unknown as ExecuteProgramParam);
        program.run().catch((e) => console.error(e));
    })
    .strictCommands()
    .demandCommand(1)
    .parse();