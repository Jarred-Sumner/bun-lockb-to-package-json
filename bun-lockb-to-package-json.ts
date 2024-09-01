#!/usr/bin/env bun
import { $ } from "bun";
import { resolve, join, relative } from "path";
import { realpathSync } from "fs";
let lockfilePath = realpathSync(process.argv[2] || resolve("."));
const env = {
  ...process.env,
  BUN_FEATURE_FLAG_INTERNAL_FOR_TESTING: 1,
  BUN_GARBAGE_COLLECTOR_LEVEL: "1",
};
$.env(env);
if (lockfilePath.endsWith("bun.lockb")) {
  lockfilePath = resolve(lockfilePath, "..");
}

if (!lockfilePath) {
  console.log(`Usage: bunx bun.lockb2repo <lockfile-path> [output-path]

Example:

  bunx bun.lockb2repo . out
  bunx bun.lockb2repo .
`);
  process.exit(1);
}

const arg = /*js*/ `JSON.stringify((await import("bun:internal-for-testing")).install_test_helpers.parseLockfile(${JSON.stringify(
  lockfilePath
)}))`;

const lockfile = await $`bun --print ${arg}`.json();

function toPackageJSON(
  package_id: number,
  collectWorkspaceIDs?: Array<number>
) {
  const pkg = lockfile.packages[package_id];
  let dependencies = {},
    devDependencies = {},
    peerDependencies = {},
    optionalDependencies = {},
    bin = pkg.bin || {};

  let name = pkg.name;
  let version = pkg.resolution.value;
  if (pkg.resolution.workspace) {
    version = undefined;
  }
  let scripts = pkg.scripts;
  let workspaces = [];
  for (let depID of pkg.dependencies || []) {
    const dependency = lockfile.dependencies[depID];
    if (!dependency) continue;
    if (dependency.behavior.workspace) {
      workspaces.push(dependency.literal);
      if (collectWorkspaceIDs && dependency.package_id) {
        collectWorkspaceIDs.push(dependency.package_id);
      }
    }
    if (dependency.behavior.normal) {
      dependencies[dependency.name] = dependency.literal;
    }
    if (dependency.behavior.dev) {
      devDependencies[dependency.name] = dependency.literal;
    }
    if (dependency.behavior.peer) {
      peerDependencies[dependency.name] = dependency.literal;
    }
    if (dependency.behavior.optional) {
      optionalDependencies[dependency.name] = dependency.literal;
    }
  }

  workspaces = [...new Set(workspaces)];
  if (!collectWorkspaceIDs) {
    workspaces = [];
  }

  if (!scripts) {
    scripts = undefined;
  }

  if (!bin) {
    bin = undefined;
  }

  if (!dependencies) {
    dependencies = undefined;
  }

  if (!devDependencies) {
    devDependencies = undefined;
  }

  if (!peerDependencies) {
    peerDependencies = undefined;
  }

  if (!optionalDependencies) {
    optionalDependencies = undefined;
  }

  return {
    name,
    version,
    workspaces,
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies,
    scripts,
    bin,
  };
}

if (process.argv[3]) {
  console.log(
    "Loaded lockfile from",
    pretty(lockfilePath),
    `(${lockfile.packages.length}) packages`
  );
}

const workspaceIDs = [];
const root = toPackageJSON(0, workspaceIDs);
const workspaces = {};
for (const workspaceID of workspaceIDs) {
  const pkg = toPackageJSON(workspaceID);

  workspaces[
    lockfile.workspace_paths[lockfile.packages[workspaceID].name_hash]
  ] = pkg;
}

function formatter(key: string, value: any) {
  if (!value || Object.keys(value).length === 0) {
    return undefined;
  }
  return value;
}

const rootPackage = JSON.stringify(root, formatter, 2);
function pretty(outpath) {
  return relative(process.cwd(), outpath);
}
if (process.argv[3]) {
  let outpath = process.argv[3];
  try {
    outpath = resolve(outpath);
  } catch (e) {
    console.error("Failed to resolve path", e);
    process.exit(1);
  }
  await Bun.write(join(outpath, "package.json"), rootPackage);
  console.log();
  console.log(
    "Saved package.json to:\n",
    "  ",
    pretty(join(outpath, "package.json")),
    "\n"
  );
  for (const [subpath, workspace] of Object.entries(workspaces)) {
    await Bun.write(
      join(outpath, subpath, "package.json"),
      JSON.stringify(workspace, formatter, 2)
    );
    console.log(
      `Saved ${workspace.name} to:\n`,
      "  ",
      pretty(join(outpath, subpath, "package.json")),
      "\n"
    );
  }
} else {
  console.log(rootPackage);
}
