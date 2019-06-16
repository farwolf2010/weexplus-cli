var fs=require('fs');
const util=require('../utils')
const ut=require('../util')
const file=require('../file')
const clone=require('../clone')
var replace = require("replace");
const log=require('../logger')
var inquirer = require('inquirer')
const rimraf = require('rimraf')
const copy = require('copy-concurrently')
function create(op){
    op.action='create'
    if(op.name==undefined)
    op.name=getName(op.url)
    op.url=op.url.replace('https://github.com/','')
    // console.log(op)
    make(op)
}
function add(op){
    op.action='add'
    op.name=getName(op.url)
    op.url=op.url.replace('https://github.com/','')
    make(op)
}
function getName(url){
    let p=url.split('/')
    let name=p[p.length-1]
    name=name.replace('.git','')
    return name
}
function make(op){

    log.info('开始创建插件')
    mkplugins()
    var path=  process.cwd();
    path+='/plugins/'+op.name
    if(checkModuleExist(op)){
        inquirer.prompt([{
            type: 'confirm',
            message: `已存在名为${op.name}的插件，是否覆盖安装？`,
            name: 'ok'
        }]).then(answers => {
            if (answers.ok) {
                rimraf(path, () => {
                    download(op)
                })
            }else{
                log.fatal('放弃创建！')
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
    console.log(op)
    op.action='remove'
    if(op.platform=='all'){
        changeSetting(op,false)
        changeGradle(op,false)
        changeProfile(op,false,()=>{
            removePorject(op)
        })
    }else if(op.platform=='android'){
        changeSetting(op,false)
        changeGradle(op,false)
        removePorject(op)
    }else if(op.platform=='ios'){
        changeProfile(op,false,()=>{
            removePorject(op)
        })
    }
}

function updateVersion(op){
    var path=  process.cwd();
    path+='/plugins/plugins.json'
    let j={}
    if(fs.existsSync(path)){
         j= ut.readJson(path)
    }
    // console.log('kk='+op.action)
    let v='latest'
    if(op.tag){
        v=op.tag
    }
    if(op.action=='remove'){
        //
        delete j[op.name]
    }else{
        j[op.name]={version:v,url:'https://github.com/'+op.url}
    }

    // console.log('SSS='+JSON.stringify(j))
    let str = JSON.stringify(j,"","\t")
    // console.log('SSS='+str)
    fs.writeFileSync(path, str)

}

function removePorject(op){
    process.chdir('../../../')
    var path=  process.cwd();
    path+='/plugins/'+op.name
    if(op.platform!='all'){
        path+='/'+op.platform
    }
    // console.log(path)

    rimraf(path, () => {
        if(op.platform=='all')
        updateVersion(op)
        log.info('插件移除完毕！')
    })

}
function renameProject(op)
{
    var path=process.cwd()+'/plugins/'+op.name+'/ios/plugintemplate/plugintemplate.podspec'
    var dir=process.cwd()+'/'
    // console.log(path)
    replace({
        regex: "plugintemplate",
        replacement: op.name,
        paths: [path],
        recursive: true,
        silent: true,
    });
    renameClass(dir,op)
    fs.renameSync(dir+'plugins/'+op.name+'/android/plugintemplate',dir+'plugins/'+op.name+'/android/'+op.name)
    fs.renameSync(dir+'plugins/'+op.name+'/ios/plugintemplate/plugintemplate.podspec',dir+'plugins/'+op.name+'/ios/plugintemplate/'+op.name+'.podspec')
    fs.renameSync(dir+'plugins/'+op.name+'/ios/plugintemplate',dir+'plugins/'+op.name+'/ios/'+op.name)




}
function renameClass(dir,op) {
    var pathcomponent=dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/weexplus/plugin/component/WXDemoComponent.java'

    var pathview=dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/weexplus/plugin/view/DemoView.java'
    var pathinit=dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/weexplus/plugin/init/PluginInit.java'
    var pathmodule=dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/weexplus/plugin/module/WXDemoModule.java'
    var mainfest=dir+'plugins/'+op.name+'/android/plugintemplate/src/main/AndroidManifest.xml'

    var pathcomponentiosh=dir+'plugins/'+op.name+'/ios/plugintemplate/WXDemoComponent.h'
    var pathcomponentiosm=dir+'plugins/'+op.name+'/ios/plugintemplate/WXDemoComponent.m'
    var iosentryh=dir+'plugins/'+op.name+'/ios/plugintemplate/WXDemoEntry.h'
    var iosentrym=dir+'plugins/'+op.name+'/ios/plugintemplate/WXDemoEntry.m'
    var iosmoduleh=dir+'plugins/'+op.name+'/ios/plugintemplate/WXDemoModule.h'
    var iosmodulem=dir+'plugins/'+op.name+'/ios/plugintemplate/WXDemoModule.m'

    replace({
        regex: "com.farwolf.plugintemplate",
        replacement: 'com.'+op.name+'.plugin',
        paths: [mainfest],
        recursive: true,
        silent: true,
    })
    replace({
        regex: "WXDemoModule",
        replacement: 'WX'+getUperName(op)+'Module',
        paths: [iosmoduleh,iosmodulem],
        recursive: true,
        silent: true,
    })

    replace({
        regex: "WXDemoEntry",
        replacement: 'WX'+getUperName(op)+'Entry',
        paths: [iosentryh,iosentrym],
        recursive: true,
        silent: true,
    })
    replace({
        regex: "WXDemoComponent",
        replacement: 'WX'+getUperName(op)+'Component',
        paths: [pathcomponent,pathcomponentiosh,pathcomponentiosm],
        recursive: true,
        silent: true,
    })
    replace({
        regex: "demo",
        replacement: op.name,
        paths: [pathcomponent,pathcomponentiosm,iosmodulem],
        recursive: true,
        silent: true,
    })
    replace({
        regex: "com.weexplus.plugin",
        replacement: 'com.'+op.name+'.plugin',
        paths: [pathcomponent,pathview,pathinit,pathmodule],
        recursive: true,
        silent: true,
    })
    replace({
        regex: "DemoView",
        replacement: getUperName(op)+'View',
        paths: [pathcomponent],
        recursive: true,
        silent: true,
    })
    replace({
        regex: "WXDemoModule",
        replacement: 'WX'+getUperName(op)+'Module',
        paths: [pathmodule],
        recursive: true,
        silent: true,
    })
    replace({
        regex: "DemoView",
        replacement: ''+getUperName(op)+'View',
        paths: [pathview],
        recursive: true,
        silent: true,
    })
    fs.renameSync(pathcomponent,dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/weexplus/plugin/component/WX'+getUperName(op)+'Component.java')
    fs.renameSync(pathview,dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/weexplus/plugin/view/'+getUperName(op)+'View.java')
    fs.renameSync(pathmodule,dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/weexplus/plugin/module/WX'+getUperName(op)+'Module.java')

    fs.renameSync(iosentryh,dir+'plugins/'+op.name+'/ios/plugintemplate/WX'+getUperName(op)+'Entry.h')
    fs.renameSync(iosentrym,dir+'plugins/'+op.name+'/ios/plugintemplate/WX'+getUperName(op)+'Entry.m')
    fs.renameSync(iosmoduleh,dir+'plugins/'+op.name+'/ios/plugintemplate/WX'+getUperName(op)+'Module.h')
    fs.renameSync(iosmodulem,dir+'plugins/'+op.name+'/ios/plugintemplate/WX'+getUperName(op)+'Module.m')
    fs.renameSync(pathcomponentiosh,dir+'plugins/'+op.name+'/ios/plugintemplate/WX'+getUperName(op)+'Component.h')
    fs.renameSync(pathcomponentiosm,dir+'plugins/'+op.name+'/ios/plugintemplate/WX'+getUperName(op)+'Component.m')


    fs.renameSync(dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/weexplus',dir+'plugins/'+op.name+'/android/plugintemplate/src/main/java/com/'+op.name)

}

function getUperName(op){
    let n=op.name
    let ary=n.split('')
    let res=''
    for(let i=0;i<ary.length;i++){

        if(i==0){
            res+=ary[i].toUpperCase()
        }else{
            res+=ary[i]
        }
    }
    return res

}


function download(op){
    const downloadRepo = require('download-repo')

    // download egoist/tooling's master branch archive
    let has=false
    if(!fs.existsSync('plugins/'+op.name)){
        op.platform='all'
    }
    if(op.action=='create'){
        process.chdir('plugins/')
    }else if(op.action=='add'){
        if(op.platform!='all'){
                process.chdir('plugins/'+op.name)
        }else{
            process.chdir('plugins/')
        }

    }

    let url=op.url
    let dinfo={}
    dinfo.target=op.name
    if(op.tag)
        dinfo.tag=op.tag
    // console.log('dinfo='+JSON.stringify(dinfo))
    downloadRepo(url, dinfo)
        .then(() => {
            log.info('模板下载完毕，开始安装！')


            var path=  process.cwd();
            if(op.action=='create') {
                process.chdir('../')
                renameProject(op)
            }else{
                if(op.platform!='all'){
                    file.del(path+'/'+op.platform)
                    // console.log(path)
                    // console.log('from:'+path+'/'+op.name+'/'+op.platform)
                    // console.log('to:'+path)
                    copy(path+'/'+op.name+'/'+op.platform,path+'/'+op.platform).then(()=>{
                        file.del(path+'/'+op.name)
                        process.chdir('../../')
                        if(op.platform=='android'){
                            addSetting(op)
                            addGradle(op)
                            invokeScript(op)
                        }else{
                            changeProfile(op,true,()=>{
                                invokeScript(op)
                            })
                        }
                    })
                    return

                }else{
                    process.chdir('../')
                }
            }
            addSetting(op)
            addGradle(op)
            changeProfile(op,true,()=>{
                invokeScript(op)
            })



        },(exp)=>{

            console.log('exp='+exp)
            log.fatal('插件'+op.name+'下载失败！')

        })

}

function checkModuleExist(op){
    var path=  process.cwd();
    path+='/plugins/'+op.name
    if(op.action=='add'){
        if(op.platform!='all'){
            path+='/plugins/'+op.name+'/'+op.name
        }
    }
    return fs.existsSync(path)

}
function mkplugins(){
    var path=  process.cwd();
    path+='/plugins/'
    if(!fs.existsSync(path)){
        file.mkdir(path)
    }
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
        out.push('project(\''+':'+op.name+'\').projectDir = new File(\'../../../plugins/'+op.name+'/android/'+op.name+'\')')
    }
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
    process.chdir('../../../')
    var path=  process.cwd();
    updateVersion(op)
    // console.log('opsssss='+path)
    path+='/plugins/'+op.name
    // process.chdir(process.cwd()+'/platforms/android/')
    if(!fs.existsSync(path+'/.wxpScript/index.js')){
        log.info('无脚本需要执行！')
        log.info('插件'+op.name+' 创建完成!')
        if(op.callback)
            op.callback()
        return
    }
    log.info('开始执行插件自带脚本！')
    util.exec('node '+path+'/.wxpScript/index.js').then(()=>{
        log.info('插件'+op.name+'创建完成!')
        if(op.callback)
            op.callback()
    })

}


function changeProfile(op,add,callback){
    // log.info('项目下存在同名module，请先删除!')
    // return
    // /Users/zhengjiangrong/Documents/GitHub/weexplus/platforms/ios/weexplus/Podfile
    let path=process.cwd()
    path+='/platforms/ios/'+op.dir+'/Podfile'
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
        out.push('    pod \''+op.name+'\', :path => \''+'../../../plugins/'+op.name+'/ios/'+op.name+'\'')
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
    var os=require('os')
    if(os.platform()!='darwin')
    {
        log.info('插件'+op.name+' ios端添加完成!')
        if(callback)
            callback()
        return;
    }
    process.chdir(process.cwd()+'/platforms/ios/'+op.dir)
    log.info('开始执行pod install!')
    util.exec('pod install').then(()=>{
        if(add)
            log.info('插件'+op.name+' ios端添加完成!')
        else{
            log.info('插件'+op.name+' ios端清理完成!')
        }
        if(callback)
            callback()
    })



}

module.exports={add,create,checkModuleExist,addSetting,addGradle,changeSetting,changeGradle,download,remove}




