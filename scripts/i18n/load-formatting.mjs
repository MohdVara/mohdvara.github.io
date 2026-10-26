import ts from 'typescript';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
export async function loadFormatting() {
  const json = async name => JSON.parse(await readFile(`src/i18n/${name}.json`, 'utf8'));
  const registry = await json('languages');
  const run = async (file, imports) => {
    const context = {exports:{}, require:name => imports[name]};
    vm.runInNewContext(ts.transpileModule(await readFile(`src/i18n/${file}.ts`, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, context);
    return context.exports;
  };
  const conversion = await run('calendarConversion', {'./tamilSolar.json':{default:await json('tamilSolar')},'./malaysianHijri.json':{default:await json('malaysianHijri')}});
  return run('formatting', {'./calendarConversion':conversion,'./languages':{language:locale => registry.find(item => item.locale === locale)}});
}
