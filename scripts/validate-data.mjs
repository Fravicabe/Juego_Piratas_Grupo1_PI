import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Every JSON content file must be listed here so the CI gate cannot silently
 * skip a new data file. Add the file and its schema in the same PR.
 */
const DATA_FILES = [
  {
    label: "resources",
    data: "src/data/resources.json",
    schema: "schemas/resources.schema.json",
  },
  {
    label: "skills",
    data: "src/data/skills.json",
    schema: "schemas/skills.schema.json",
  },
  {
    label: "islands",
    data: "src/data/islands.json",
    schema: "schemas/islands.schema.json",
  },
];

const ajv = new Ajv({ allErrors: true, strict: true });

function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);

  try {
    return JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot read ${relativePath}: ${reason}`);
  }
}

function formatSchemaErrors(label, errors) {
  return (errors ?? []).map((error) => {
    const location = error.instancePath || "/";
    return `${label}${location}: ${error.message}`;
  });
}

function duplicateIds(items, label) {
  const seen = new Set();
  const duplicates = new Set();

  for (const item of items) {
    if (!item || typeof item.id !== "string") continue;
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  }

  return [...duplicates].map((id) => `${label}: duplicate id "${id}"`);
}

function checkIslandReferences(islands, resourceIds) {
  const errors = [];
  const islandIds = new Set(
    islands.map((island) => island?.id).filter((id) => typeof id === "string"),
  );
  const references = new Map();

  for (const island of islands) {
    if (!island || typeof island.id !== "string") continue;

    if (Array.isArray(island.resources)) {
      const seen = new Set();

      for (const resourceId of island.resources) {
        if (!resourceIds.has(resourceId)) {
          errors.push(`islands: "${island.id}" uses unknown resource "${resourceId}"`);
        }
        if (seen.has(resourceId)) {
          errors.push(`islands: "${island.id}" lists resource "${resourceId}" twice`);
        }
        seen.add(resourceId);
      }
    }

    if (island.unlockCost && typeof island.unlockCost === "object") {
      for (const resourceId of Object.keys(island.unlockCost)) {
        if (!resourceIds.has(resourceId)) {
          errors.push(`islands: "${island.id}" unlockCost uses unknown resource "${resourceId}"`);
        }
      }
    }

    if (typeof island.requiresIslandId === "string") {
      if (island.requiresIslandId === island.id) {
        errors.push(`islands: "${island.id}" cannot require itself`);
      } else if (!islandIds.has(island.requiresIslandId)) {
        errors.push(`islands: "${island.id}" requires unknown island "${island.requiresIslandId}"`);
      } else {
        references.set(island.id, island.requiresIslandId);
      }
    }
  }

  // Detect cycles such as nassau -> skull_isle -> nassau, which would make
  // both islands permanently locked.
  for (const islandId of references.keys()) {
    const visited = [];
    let current = islandId;

    while (references.has(current)) {
      if (visited.includes(current)) {
        errors.push(`islands: unlock cycle detected (${[...visited, current].join(" -> ")})`);
        break;
      }
      visited.push(current);
      current = references.get(current);
    }
  }

  return errors;
}

/**
 * Validates every data file against its JSON schema plus the cross-file rules
 * that JSON Schema cannot express (unique ids, island/resource references).
 *
 * Returns `{ valid, errors }` so the CLI and the tests can share the result.
 */
export function validateData() {
  const errors = [];
  const parsed = {};
  const compiled = {};

  for (const entry of DATA_FILES) {
    try {
      const schema = readJson(entry.schema);
      compiled[entry.label] = ajv.compile(schema);
    } catch (error) {
      errors.push(`${entry.schema}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    try {
      parsed[entry.label] = readJson(entry.data);
    } catch (error) {
      errors.push(`${entry.data}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  for (const entry of DATA_FILES) {
    const validate = compiled[entry.label];
    const data = parsed[entry.label];
    if (!validate || data === undefined) continue;

    if (!validate(data)) {
      errors.push(...formatSchemaErrors(entry.data, validate.errors));
    }
  }

  const resources = Array.isArray(parsed.resources) ? parsed.resources : [];
  const skills = Array.isArray(parsed.skills) ? parsed.skills : [];
  const islands = Array.isArray(parsed.islands) ? parsed.islands : [];

  errors.push(...duplicateIds(resources, "resources"));
  errors.push(...duplicateIds(skills, "skills"));
  errors.push(...duplicateIds(islands, "islands"));

  const resourceIds = new Set(resources.map((resource) => resource?.id).filter(Boolean));
  errors.push(...checkIslandReferences(islands, resourceIds));

  if (islands.length > 0 && !islands.some((island) => island?.unlocked)) {
    errors.push("islands: at least one island must start unlocked");
  }

  return { valid: errors.length === 0, errors };
}

const isMain =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const { valid, errors } = validateData();

  if (!valid) {
    console.error(`Data validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
  } else {
    console.log(`Data validation passed (${DATA_FILES.map((entry) => entry.label).join(", ")}).`);
  }
}
