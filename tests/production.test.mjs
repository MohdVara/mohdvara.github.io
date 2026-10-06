import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access, stat } from "node:fs/promises";
import { join } from "node:path";
const html = await readFile("dist/index.html", "utf8");

test("production delivers real content without client-side JavaScript", () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(html, /<main/);
  assert.match(html, /Principal Full-Stack Engineer/);
  assert.match(html, /Minute-by-minute attendance tracking/);
  assert.match(html, /Human Resource Management System/);
  assert.doesNotMatch(
    html,
    /app-html|Vite \+ React|Cambridge|Duden|info@yoursite|single\.html/,
  );
});
test("all fragment links have unique targets", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
    assert.ok(ids.includes(id), `Missing target: ${id}`);
  assert.doesNotMatch(html, /href="#"/);
});
test("all shipped HTML asset paths exist and are lightweight", async () => {
  const paths = [...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map(
    (match) => match[1],
  );
  for (const path of paths) await access(join("dist", path));
  assert.ok((await stat("dist/images/portrait.webp")).size < 100_000);
  for (const [, path] of html.matchAll(/src="(\/assets\/[^" ]+\.js)"/g))
    assert.ok((await stat(join("dist", path))).size < 200_000);
});
test("metadata, schema and domain agree", async () => {
  assert.match(
    html,
    /rel="canonical" href="https:\/\/mohd\.paramasvara\.online\/"/,
  );
  const schema = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1],
  );
  assert.equal(schema["@graph"][0].name, "Mohd. Paramasvara");
  assert.ok(
    schema["@graph"][0].sameAs.includes(
      "https://www.linkedin.com/in/mohdvara/",
    ),
  );
  assert.equal(
    (await readFile("dist/CNAME", "utf8")).trim(),
    "mohd.paramasvara.online",
  );
  assert.match(
    await readFile("dist/sitemap.xml", "utf8"),
    /https:\/\/mohd\.paramasvara\.online\//,
  );
  await access("dist/og-image.png");
});
