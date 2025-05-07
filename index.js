
const FormData = require('form-data')
const fs = require("fs/promises");
const fss = require("fs")
const hound = require('hound')
const PathsAuth = require("./authandpaths");
let fetch;
let chokidar;
let api_url="https://nekoweb.org/api/";


let queue = new Map();
let folders = new Map();

let base = new Map();
let compare = new Map();

let completionsignals =[[],[]];

function recursiveRead(err, dir, path, storage, signal, sig, top, ind=-1,cache =false) {
  if(err !==null){
    console.warn(err);
  }
  if(dir === undefined || dir.length == 0) {
    top[ind]=true
    if(sig!=null){sig();}
    return;
  }
  
  
  let prop = function(){
    let done = true;
    for(let i = 0; i < dir.length; i++){
      if(signal[i]!==true){
        done = false;
      }
    }
    if(done){
      top[ind] = true;
      if(sig!=null){sig();}
      // console.log(completionsignals)
    }
  }
  
  for(let i = 0; i < dir.length; i++){
    signal.push([])
  }
  for(let i = 0; i < dir.length; i++){
    let file = dir[i];
    if(file.isFile()){
      console.log(`${path}${file.name}`);
      fss.readFile(`${PathsAuth.source}/${path}${file.name}`, 'utf8', (err,data)=>{
        if(err !==null){
          console.warn(err);
        }
        signal[i] = true;
        prop();
        if(data === undefined) return;
        storage.set(`${path}${file.name}`,{name:`${path}${file.name}`,data:data,delete:false, loaded:true, cached:cache});
        // console.log(storage.keys());
      })
    }else{
      fss.readdir(`${PathsAuth.source}/${path}${file.name}`, {withFileTypes:true}, (err,files)=>{recursiveRead(err,files,`${path}${file.name}/`,storage,signal[i],prop,signal,i+0,cache)});
    }
  }
}

let basetop = function(){
  let done = true;
  for(let i = 0; i < completionsignals[0].length; i++){
    if(completionsignals[0][i]!==true){
      done =false
    }
  }
  if(done){
    completionsignals[0] = true;
    start();
  }
}

let sourcetop = function(){
  let done = true;
  for(let i = 0; i < completionsignals[1].length; i++){
    if(completionsignals[1][i]!==true){
      done =false
    }
  }
  if(done){
    completionsignals[1] = true;
    start();
  }
}

fss.readdir(PathsAuth.cacheSources, {withFileTypes:true}, (err,files)=>{recursiveRead(err,files,"" ,base,completionsignals[0],basetop,completionsignals,0,true)});
fss.readdir(PathsAuth.source, {withFileTypes:true}, (err,files)=>{recursiveRead(err,files,"" ,compare,completionsignals[1],sourcetop,completionsignals,1)});

function filesChanged(file, isnew, deleted, stats = null){
  const key = file.substring(PathsAuth.source.length);
  if(stats){
    console.log(key);
    
  }
}

async function core() {
    fetch = (await import('node-fetch')).default;
    chokidar = (await import('chokidar')).default;
  try{
    let watcher = chokidar.watch(PathsAuth.source, {awaitWriteFinish: true});
    // let watcher = hound.watch(PathsAuth.source);
    // watcher.on('create', (file, stats)=>{filesChanged(file,true,false,stats)})
    // watcher.on('change', (file, stats)=>{filesChanged(file,false,false,stats)})
    // watcher.on('delete', (file)=>{filesChanged(file,false,true)})
  }
  catch(e){console.warn(e)}
  // setTimeout(process,90000);
}

function start(){
  console.log(completionsignals)
  if(completionsignals[0]===true && completionsignals[1]===true){
    
    for(let name of compare.keys()){
      let newObj = compare.get(name);
      if(base.has(name)){
        let cachedObj = base.get(name);
        if(cachedObj.data != newObj.data){
          queue.set(name,newObj);
        }
      }else{
        queue.set(name,newObj);
      }
    }
    for(let name of base.keys()){
      let cachedObj = base.get(name);
      if(!compare.has(name)){
        cachedObj.delete = true;
        queue.set(name,cachedObj);
      }
    }
    base.clear();
    compare.clear();
    // console.log((queue.values()))
    core();
    
  }else{
    return;
  }
}


function process(){
  let count = 0;
  for(let name of compare.keys()){
    if(count >= 50){
      break;
    }
  }
}