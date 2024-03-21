# Introduction

This repository contains scripts to generate SQL insert statements based on CSV input file following the NEM12 specification.

# How to use

Run this command to install project dependencies.

```sh
pnpm install --frozen-lockfile
```

To generate an output file based on `src/sample-input.csv`, simply run this command.
This will generate the SQL statements to a file `output.sql`.

```sh
pnpm start
```

You could also use a different input file like the command below.

```sh
pnpm exec ts-node src/index.ts path/to/another/input/file.csv
```

Additionally, you could generate the SQL statements to a different output file, if needed.

```sh
pnpm exec ts-node src/index.ts src/sample-input.csv path/to/another/output/file.sql
```