var fs=require('fs');
const util=require('../utils')
const file=require('../file')
const log=require('../logger')
var inquirer = require('inquirer')
const rimraf = require('rimraf')

function add(op){
  log.info('开始添加ios端插件')
  var path=  process.cwd();
  path+='/platforms/ios/'+op.dir+'/'+op.name
  if(checkModuleExist(op)){
    inquirer.prompt([{
      type: 'confirm',
      message: `ios端已存在名为${op.name}的插件，是否覆盖安装？`,
      name: 'ok'
    }]).then(answers => {
      if (answers.ok) {
        rimraf(path, () => {
          download(op)
        })
      }
      else{
        log.fatal('放弃安装！')
        log.fatal('------------------------------------')
        log.fatal('---------------分割线----------------')
        log.fatal('------------------------------------')

      }
    }).catch(console.error)
    return
  }else{
    download(op)
  }
}

function checkModuleExist(op){
  var path=  process.cwd();
  path+='/platforms/ios/'+op.dir+'/'+op.name
  return fs.existsSync(path)

}
function remove(op){
  var path=  process.cwd();
  path+='/platforms/ios/'+op.dir+'/'
  process.chdir(path)
  changeProfile(op,false)
  removePorject(op)
}
function removePorject(op){
  var path=  process.cwd();
  path+='/'+op.name
  rimraf(path, () => {
    log.info('ios端插件移除完毕，开会清理！')
  })

}
function download(op){
  const downloadRepo = require('download-repo')
  // download egoist/tooling's master branch archive
  process.chdir('platforms/ios/'+op.dir)
  let url=op.ios_url.replace('https://github.com/','')
  url=url.replace('.git','')
  let dinfo={}
  dinfo.target=op.name
  if(op.tag)
    dinfo.tag=op.tag
  downloadRepo(url, dinfo)
  .then(() => {
    log.info('插件'+op.name+' ios端下载完毕，开始安装！')
    changeProfile(op,true)

  },(exp)=>{
    console.log('exp='+exp)
    log.fatal('插件'+op.name+' iod端下载失败！')
  })

}
function changeProfile(op,add){
  // log.info('项目下存在同名module，请先删除!')
  // return
  // /Users/zhengjiangrong/Documents/GitHub/weexplus/platforms/ios/weexplus/Podfile
  let path=process.cwd()
  path+='/Podfile'
  var result=fs.readFileSync(path, 'utf8')
  let temp=result.split('\n')
  let out=[]
  let weg=[]
  let hasEnd=false
  temp.forEach((item)=>{
    if(item.trim()=='end'){
      hasEnd=true
    }
    if(!hasEnd){
      if(item.indexOf('\''+op.name+'\'')==-1){
        out.push(item)
      }
    }
    else{
      weg.push(item)
    }

  })
  if(add)
  out.push('    pod \''+op.name+'\', :path => \''+op.name+'\'')
  // out.push('    end')

   weg.forEach((item)=>{
     out.push(item)
   })
  let px=''
  out.forEach((item)=>{
    px+=item+'\n'
  })
  // console.log(px)
  fs.writeFileSync(path,px,{encode:'utf-8'})
  // console.log(process.cwd()
  log.info('开始执行pod install!')
  util.exec('pod install').then(()=>{
    if(add)
    log.info('插件'+op.name+' ios端添加完成!')
    else{
      log.info('插件'+op.name+' ios端清理完成!')
    }
  })



}

module.exports={add,remove}