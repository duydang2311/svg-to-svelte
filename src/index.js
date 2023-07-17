import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { optimize } from "svgo";

/** @type {string[]} */
const dirs = ["src/icons"];

/** @type {string[]} */
const svgs = [];

/** @type {Set<string>} */
const iconNames = new Set();

while (dirs.length) {
  const dir = dirs.shift();
  const files = fsSync.readdirSync(dir);
  for (const file of files) {
    const path = `${dir}/${file}`;
    const stats = fsSync.statSync(path);
    if (stats.isDirectory()) {
      dirs.push(path);
    } else if (file.endsWith(".svg")) {
      svgs.push(path);
    }
  }
}

const length = 4; // "<svg".length;

const transformFileName = (name) => {
  return (
    name[0].toUpperCase() +
    name.substring(1).replace(/-(.)/g, (_, $1) => $1.toUpperCase())
  );
};

const promises = [];
const outDir = `dist/icons`;
console.time("conversion takes");
for (const file of svgs) {
  /** @type {string} */
  const fileName = transformFileName(path.basename(file));
  const extensionlessName = fileName.substring(0, fileName.length - 4);
  iconNames.add(extensionlessName);
  promises.push(
    fs
      .access(outDir, fs.constants.F_OK)
      .catch(() => fs.mkdir(outDir, { recursive: true }))
      .then(() => fs.readFile(file))
      .then((buffer) => optimize(buffer, { multipass: true, path: file }))
      .then((result) =>
        fs.writeFile(
          `${outDir}/${extensionlessName}.svelte`,
          `<svg {...$$restProps}${result.data.substring(length)}`,
          (err) => {
            if (err) {
              throw err;
            }
          }
        )
      )
  );
}

await Promise.all(promises);

await fs.rm("./dist/index.js");

const js = `export type IconName = ${Array.from(iconNames.values())
  .map((name) => "'" + name + "'")
  .join("|")};`;
fs.writeFile("./dist/index.d.ts", js);

for (const name of iconNames) {
  const str = `export { default as ${name} } from './icons/${name}.svelte';`;
  fs.appendFile("./dist/index.js", str);
  fs.appendFile("./dist/index.d.ts", str);
}

console.timeEnd("conversion takes");
console.log("number of files:", iconNames.size);
