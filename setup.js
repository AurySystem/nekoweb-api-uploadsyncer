
const fs = require("fs");

let auth = "a";
let sources = "b";
let cache = "d";

let temp = `const auth = "${auth}"; // your api token here
const source = "${sources}"; // source folder for incoming .mds and the current template html and css
const cacheSources = "${cache}"; // cache for comparing .mds on startup and the template

module.exports = {
  auth,
  source,
  cacheSources
};`


const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
  });
  readline.question(`Enter API key: `, en => {
    console.log(`Confirmed`);
    auth = en;
    
    readline.question(`Enter md source directory: `, en => {
      console.log(`Confirmed`);
      sources = en;
      readline.question(`Enter caching directory: `, en => {
        console.log(`Finalizing`);
        cache = en;
temp = `const auth = "${auth}"; // your api token here
const source = "${sources}"; // source folder for incoming .mds and the current template html and css
const cacheSources = "${cache}"; // cache for comparing .mds on startup and the template

module.exports = {
  auth,
  source,
  cacheSources
};`
        console.log(temp);
        readline.close();
        fs.promises.writeFile('./authandpaths.js', temp).catch(er => {
          if (er) {
            console.error(er);
          }
        });
      });      
    });
  });

  