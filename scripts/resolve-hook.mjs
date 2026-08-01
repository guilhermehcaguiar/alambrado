import { pathToFileURL } from "node:url";
import path from "node:path";

const SRC_URL = pathToFileURL(path.join(process.cwd(), "src") + path.sep).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const relative = specifier.slice(2);
    return { url: new URL(relative + ".ts", SRC_URL).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
