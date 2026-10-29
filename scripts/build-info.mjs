import {mkdir,writeFile} from 'node:fs/promises';
import {createSiteBuildInfo} from './build-revision.mjs';
await mkdir('output/build',{recursive:true});
await writeFile('output/build/site-build.json',JSON.stringify(createSiteBuildInfo(),null,2)+'\n');
