const fs = require('fs')
const path = require('path');
const output = require('./output')
const log = require('./logger')
const regex = require('./regex')
const validator = require('./validator')
const child_process = require('child_process')
const os =require('os')
const npm = require("npm");
const utils = {

  regex:regex.regex,
  regexOne:regex.regexOne,
  logger:log.logger,
  copyAndReplace(src, dest, replacements) {
    if (fs.lstatSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest)
      }
    } else {
      let content = fs.readFileSync(src, 'utf8')
      Object.keys(replacements).forEach(regex => {
        content = content.replace(new RegExp(regex, 'gm'), replacements[regex])
      })
      fs.writeFileSync(dest, content)
    }
  },
  appId(px){
    // let px='/Users/zhengjiangrong/Documents/GitHub/weexplus/platforms/ios/weexplus/weexplus.xcodeproj/project.pbxproj'
// var path=  process.cwd();
// path+='/platforms/android/'+op.dir+'/settings.gradle'
    var result=fs.readFileSync(px, 'utf8')
// console.log(result)
    let temp=result.split('\n')
    for(let q in temp){
      let res=temp[q]
      if(res.indexOf('PRODUCT_BUNDLE_IDENTIFIER')!=-1){
        return res.split('=')[1].replace(';','').trim()
      }
    }
  },

  /**
   * Find xcode project in particular directory
   * @param {String} directory
   * @return {Object} project info
   */
  findXcodeProject(dir) {
    if(!fs.existsSync(dir)) {
      return false;
    }
    const files = fs.readdirSync(dir)
    const sortedFiles = files.sort()
    for (let i = sortedFiles.length - 1; i >= 0; i--) {
      const fileName = files[i]
      const ext = path.extname(fileName)

      if (ext === '.xcworkspace') {
        return {
          name: fileName,
          isWorkspace: true,
        }
      }
      if (ext === '.xcodeproj') {
        return {
          name: fileName,
          isWorkspace: false,
        }
      }
    }

    return null
  },

  parseIOSDevicesList(text) {
    const devices = []
    const REG_DEVICE = /(.*?) \((.*?)\) \[(.*?)]/

    const lines = text.split('\n')
    for (const line of lines) {
      if (line.indexOf('Watch') >= 0 || line.indexOf('TV') >= 0 || line.indexOf('iPad') >= 0) {
        continue
      }
      const device = line.match(REG_DEVICE)
      if (device !== null) {
        const name = device[1]
        const version = device[2]
        const udid = device[3]
        const isSimulator = line.indexOf('Simulator') >= 0||udid.indexOf('-')>=0
        devices.push({name, version, udid, isSimulator})
      }
    }

    return devices
  },
  parseDevicesResult(result) {
    if (!result) {
      return [];
    }

    const devices = [];
    const lines = result.trim().split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      let words = lines[i].split(/[ ,\t]+/).filter((w) => w !== '');

      if (words[1] === 'device') {
        devices.push(words[0]);
      }
    }
    return devices;
  },
// {
//   encoding: 'utf8',
//   timeout: 0, /*子进程最长执行时间 */
//   maxBuffer: 20000*1024,  /*stdout和stderr的最大长度*/
//   killSignal: 'SIGTERM',
//   cwd: null,
//   env: null
// }
  exec(command,quiet){
    return new Promise((resolve, reject)=> {
      try {
        let child = child_process.exec(command, {encoding: 'utf8',maxBuffer: 20000*10204,timeout: 0,killSignal: 'SIGTERM',}, function () {
          resolve();
        })
        if(!quiet){
          child.stdout.pipe(process.stdout);
        }
        child.stderr.pipe(process.stderr);
      }catch(e){
        console.error('execute command failed :',e);
        reject(e);
      }
    })

  },
  execSync(command,quiet){
    try {
      let child = child_process.execSync(command, {encoding: 'utf8'})

      if(!quiet){
        console.log(child)
      }
    }catch(e){
      console.error('execute command failed :',e);
    }
  },
  buildJS(cmd = 'build',dir){
    return utils.exec('npm install',true).then(()=> {
       if(dir==undefined)
          {
            dir='weexplus'
          }
         return utils.exec('weexplus install dir' +dir);
    })
  },
  getIOSProjectInfo(){
    let projectInfoText=child_process.execSync('xcodebuild  -list', {encoding: 'utf8'});
    // console.log('klklklkl======'+projectInfoText+"==========")
    let splits=projectInfoText.split(/Targets:|Build Configurations:|Schemes:/);
    let projectInfo={};
    
    projectInfo.name=splits[0].match(/Information about project "([^"]+?)"/)[1];
    projectInfo.targets=splits[1]?splits[1].split('\n').filter(e=>!!e.trim()).map(e=>e.trim()):[];
    projectInfo.configurations=splits[2]?splits[2].split('\n').filter((e,i)=>!!e.trim()&&i<3).map(e=>e.trim()):[];
    projectInfo.schemes=splits[3]?splits[3].split('\n').filter(e=>!!e.trim()).map(e=>e.trim()):[];
    // for(var i=0;i<splits.length;i++)
    // {
    //   console.log('klklklkl======'+ projectInfo.schemes[i]+"==========")
    // }
  
    return {project:projectInfo}
  },
  checkAndInstallForIosDeploy(){
    let hasIosDeploy=fs.existsSync('./node_modules/.bin/ios-deploy');
    if(!hasIosDeploy) {
      let args='';
      if(process.platform==='win32'){
        console.log('run ios unsupported on windows');
        process.exit(1);
      }
      if (os.release() >= '15.0.0') {
        args=' --unsafe-perm=true --allow-root'
      }
      return this.exec(__dirname+'/installIosDeploy.sh'+args)
    }
    else {
      return Promise.resolve();
    }
  },
  xcopy(source,dest){
    if(process.platform==='win32'){
      cmd
    }
  },
  dashToCamel(str) {
    return str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});  
  },

  isIOSProject:function (dir){
    var result = this.findXcodeProject(dir)
    return result;
  },

  isAndroidProject:function (dir){
    if (fs.existsSync(path.join(dir, 'build.gradle'))) {
      return true
    }
  },

  isNewVersionPlugin : function(pluginName, version, callback) {
    var trynum =0
    npm.load(function(){
      var load = function(npmName){

          npm.commands.info([npmName+"@"+version], true, function(error,result){

            if(error&&trynum==0){
              trynum++;
              if(npmName == "weex-gcanvas"){
               var  prefix = "weex-plugin--"
              }
              else {
               var  prefix = "weex-plugin-"
              }
              load(prefix+npmName)
            }
            else if(error&&trynum!==0){
              throw  new Error(error)
            }
            else {
              var weexpackVersion = result[version].weexpack ;

              if(weexpackVersion&&weexpackVersion == "0.4.0"){
                callback({
                  ios: result[version].ios,
                  android: result[version].android,
                  version:result[version].version,
                  name:result[version].name,
                  weexpack:result[version].weexpack,
                  pluginDependencies:result[version].pluginDependencies
                })
              }
              else{
                callback(false)
              }
            }

          })


      }
      load(pluginName)

    })


}



}

module.exports = Object.assign(utils, output, validator)
