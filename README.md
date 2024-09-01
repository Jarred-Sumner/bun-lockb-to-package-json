# bun-lockb-to-package-json

Print a bun.lockb file as a package.json file

```bash
bunx bun-lockb-to-package-json <path-to-folder-containing-bun.lockb>
{
  "name": "bun",
  "workspaces": [
    "packages/bun-types"
  ],
  "devDependencies": {
    "@types/bun": "^1.1.3",
    "@types/react": "^18.3.3",
    "@typescript-eslint/eslint-plugin": "^7.11.0",
    "@typescript-eslint/parser": "^7.11.0",
    "@vscode/debugadapter": "^1.65.0",
    "esbuild": "^0.21.4",
    "eslint": "^9.4.0",
    "eslint-config-prettier": "^9.1.0",
    "mitata": "^0.1.11",
    "peechy": "0.4.34",
    "prettier": "^3.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "source-map-js": "^1.2.0",
    "typescript": "^5.4.5"
  }
}
```

Write a package.json file from a bun.lockb file to a specific folder, and also any workspace package.json files:

```sh
bunx bun-lockb-to-package-json <path-to-folder-containing-bun.lockb> [optional output folder]
```

## How long will this work for?

No guarantees! This uses an API we only expose for internal testing purposes.

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
