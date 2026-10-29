// Keep development, CI and release builds on the verified Node 22 line.
const [major,minor,patch]=process.versions.node.split('.').map(Number);
if(major!==22||minor<23||(minor===23&&patch<4))throw Error(`Use Node 22.23.4 or a later Node 22 patch (found ${process.versions.node}); see .nvmrc`);
console.log(`Verified runtime: Node ${process.versions.node}`);
