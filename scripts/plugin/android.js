var fs=require('fs');
const util=require('../utils')
const file=require('../file')
const log=require('../logger')
var inquirer = require('inquirer')
const rimraf = require('rimraf')
function add(op){
  log.info('开始添加android端插件')
  var path=  process.cwd();
  path+='/platforms/android/'+op.name
   if(checkModuleExist(op)){
     inquirer.prompt([{
       type: 'confirm',
       message: `android端已存在名为${op.name}的插件，是否覆盖安装？`,
       name: 'ok'
     }]).then(answers => {
       if (answers.ok) {
         rimraf(path, () => {
           download(op)
         })
       }else{
         log.fatal('放弃安装！')
         log.fatal('------------------------------------')
         log.fatal('---------------分割线----------------')
         log.fatal('------------------------------------')
         if(op.callback)
           op.callback(op)
       }
     }).catch(console.error)
     return
   }else{
     download(op)
   }
}



function remove(op){
  changeSetting(op,false)
  changeGradle(op,false)
  removePorject(op)
}

function removePorject(op){
  var path=  process.cwd();
  path+='/platforms/android/'+op.name
  rimraf(path, () => {
     log.info('android端插件移除完毕！')
  })

}


function download(op){
  const downloadRepo = require('download-repo')
  // download egoist/tooling's master branch archive
  process.chdir('platforms/android')
  let url=op.android_url.replace('https://github.com/','')
  url=url.replace('.git','')
  let dinfo={}
  dinfo.target=op.name
  if(op.tag)
  dinfo.tag=op.tag
  // console.log('dinfo='+JSON.stringify(dinfo))
  downloadRepo(url, dinfo)
  .then(() => {
    log.info('插件'+op.name+' android端下载完毕，开始安装！')
    process.chdir('../../')
    var path=  process.cwd();
    addSetting(op)
    addGradle(op)
    invokeScript(op)

  },(exp)=>{

    console.log('exp='+exp)
    log.fatal('插件'+op.name+' android端下载失败！')

  })

}

function checkModuleExist(op){
  var path=  process.cwd();
  path+='/platforms/android/'+op.name
  return fs.existsSync(path)

}

function addGradle(op){
  changeGradle(op,true)
}

function addSetting(op){
  changeSetting(op,true)
}

function changeSetting(op,add){
  // let path='platforms/android/'+op.dir+'/app/build.gradle '
  var path=  process.cwd();
    path+='/platforms/android/'+op.dir+'/settings.gradle'
  var result=fs.readFileSync(path, 'utf8')
  // console.log(result)
  let temp=result.split('\n')
  if(temp[0].indexOf(op.name)!=-1){
    log.fatal('项目下存在同名module，请先删除!')
    return
  }
  // console.log(temp)
  let out=[]
  for(let t in temp){
    if(temp[t].indexOf(op.name)==-1) {
      out.push(temp[t])
    }
  }

  if(add){
    out.push('')
    out.push('include \''+':'+op.name+'\'')
    out.push('project(\''+':'+op.name+'\').projectDir = new File(\'../'+op.name+'\')')
  }

  // console.log(out)
  let s=''
  out.forEach((item)=>{
    s+=item+'\n'
  })
  // console.log(s)
  fs.writeFileSync(path,s,{encode:'utf-8'})

}

function changeGradle(op,add){
  var path=  process.cwd();
  path+='/platforms/android/'+op.dir+'/app/build.gradle'
  // path+='/platforms/android/'+op.dir+'/settings.gradle'
  var result=fs.readFileSync(path, 'utf8')
  // let p=util.regex('apply','def',result)
  let res=''+result.substr(result.indexOf('dependencies'),result.length)
  let temp=res.split('\n')
  let out=[]
  temp.forEach((item)=>{
    if(item.indexOf(':'+op.name)==-1){
      out.push(item)
    }
  })
  let weg=out[out.length-1]
  out=out.splice(0,out.length-2)
  if(add){
    out.push('    api project(\':'+op.name+'\')')
  }
  out.push('}')
  // console.log(out)
   let px=''
  out.forEach((item)=>{
    px+=item+'\n'
  })
  result=result.replace(res,px)
  fs.writeFileSync(path,result,{encode:'utf-8'})
  // console.log(result)


}

function invokeScript(op){
  var path=  process.cwd();
  // console.log('opsssss='+path)
  path+='/platforms/android/'+op.name
  // process.chdir(process.cwd()+'/platforms/android/')
  if(!fs.existsSync(path+'/.wxpScript/index.js')){
    log.info('无脚本需要执行！')
    log.info('插件'+op.name+' android端添加完成!')
    if(op.callback)
      op.callback()
   return
  }
  log.info('开始执行插件自带脚本！')
  util.exec('node '+path+'/.wxpScript/index.js').then(()=>{
    log.info('插件'+op.name+' android端添加完成!')
    if(op.callback)
      op.callback()
  })

}

module.exports={add,checkModuleExist,addSetting,addGradle,changeSetting,changeGradle,download,remove}




