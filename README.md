# bun.lockb2repo

## Usage:

Print a bun.lockb file as a package.json file

```bash
bunx bun.lockb2repo <path-to-folder-containing-bun.lockb>
```

Write a package.json file from a bun.lockb file to a specific folder, and also any workspace package.json files:

```sh
bunx bun.lockb2repo <path-to-folder-containing-bun.lockb> [optional output folder]
```

## How long will this work for?

No guarantees! This uses an API we only expose for internal testing purposes.

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
