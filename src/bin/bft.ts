import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";
import type { Arguments } from "https://deno.land/x/yargs@v17.7.2-deno/deno-types.ts";

yargs(Deno.args)
    .command("compile <file>", "compiles a given BSM file to BF", (yargs: any) => {
        return yargs.positional('file', {
            describe: "a BSM file to be compiled",
            type: 'string',
        })
    }, (argv: Arguments) => {
        console.log(argv);
    })
    .strictCommands()
    .demandCommand(1)
    .parse();