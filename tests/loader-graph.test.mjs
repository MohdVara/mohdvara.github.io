import test from "node:test";
import assert from "node:assert/strict";
import {devPreloads} from "../scripts/loader/dev-preloads.mjs";

test("dev progress exposes the static module graph, including reexports, without fetching lazy routes",async()=>{
  const source={
    "/src/main.tsx":'import "/src/App.tsx?t=1"; import "/node_modules/react.js?v=1"; import("/src/optional-game.ts"); import "/@vite/client";',
    "/src/App.tsx?t=1":'import "./App.css"; export {value} from "./content.ts"; import "/@react-refresh";',
    "/src/App.css":'export const style = true;',
    "/src/content.ts":'import "/src/App.tsx?t=2"; export const value = 1;',
    "/node_modules/react.js?v=1":'export {react} from "./shared.js?v=1";',
    "/node_modules/shared.js?v=1":'export const react = true;',
  };
  const fetched=[];
  const urls=await devPreloads({transformRequest:async url=>{fetched.push(url);assert.ok(url in source,`Unexpected startup import: ${url}`);return{code:source[url]};}});
  assert.deepEqual(urls,["/src/App.tsx?t=1","/node_modules/react.js?v=1","/src/App.css","/src/content.ts","/node_modules/shared.js?v=1"]);
  assert.equal(fetched.length,6,"Circular imports and timestamps must not duplicate files");
  assert.ok(!urls.some(url=>url.includes("optional-game")||url.includes("@vite")||url.includes("@react-refresh")));
});
