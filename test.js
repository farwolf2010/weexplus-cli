// const ios=require('./scripts/run/ios')
const util=require('./scripts/utils')
const log=require('./scripts/logger')
const android=require('./scripts/plugin/android')
const ios=require('./scripts/plugin/ios')
const plugin=require('./scripts/plugin')
const net=require('./scripts/utils/net')
const run=require('./scripts/run/ios')
const file=require('./scripts/file')
const clone=require('./scripts/clone')
const {kill}=require('./scripts/kill')
const path = require('path')
const coding = require('./scripts/coding')
const crypto = require('crypto')
var fs=require('fs');
// const process=require('child_process')
// let start='my'
// let end='op'
// let str='my ui dsds op'
// // let res=util.regexOne(start,end,str)
// // console.log(res)
//
//
// function checkExist(name,path){
//   var fs=require('fs');
//   // let path='/Users/zhengjiangrong/Documents/GitHub/weexplus/platforms/android/weexplus/settings.gradle'
//   var result=fs.readFileSync(path, 'utf8')
//   return result.indexOf(name)!=-1
//
// }
//
// var fs=require('fs');
// let path='/Users/zhengjiangrong/Documents/GitHub/weexplus/platforms/android/weexplus/settings.gradle'
// var result=fs.readFileSync(path, 'utf8')
// console.log(result)
// let y=checkExist('oss',path)
// console.log(y)
// let find=util.regexOne('include','oss',result)
// console.log(find)

// process.chdir('/Users/zhengjiangrong/Desktop/wxpdemo')



//
// plugin.getInfo({name:'wechat'},(res)=>{
//   if(!res.ios_url){
//     log.fatal('没有这个插件')
//   }
//
//   log.info('ios:'+res.ios_url)
//   log.info('android:'+res.ios_url)
// })
// let res=util.exec('weexplus -v')
// console.log(res)


// var px=  process.cwd();


// process.chdir('/Users/zhengjiangrong/work/corenerstone/wb/wf')
// console.log('xxx='+process.cwd())
// // console.log(path.join(px,'Users/zhengjiangrong/Desktop/wwx'))
// let p={}
// p.dir='wf'
// run.runIOS(p)



// let cmd='xcodebuild -workspace wwx.xcworkspace -scheme wwx -configuration Debug -destination id=4E33AC5F-2E1B-4BD2-9C7B-CAAA5759D83F -sdk iphonesimulator -derivedDataPath build clean build'
// util.exec(cmd);

// process.chdir()
// clone.renameAndroidDir('/Users/zhengjiangrong/Desktop/boilerplate-master','com.xx.so.xxx')
// let p='com.farwolf.demo'
// p=p.replace(/\./g,'/')
// console.log(p)
// file.mkdir('com/farwolf/demo')

// process.chdir('/Users/zhengjiangrong/Desktop')
// clone.download('sourceAppCode','com.pnc.app','项目管理助手')
// clone.renameProject('xop','com.xx.so.xxx','例子')
// clone.renameAndroidDir('xop','com.xx.so.xxx')
// clone.renameIos('xop','com.xx.so.xxx')
// file.mkdir('m/n/k')




// let content = fs.readFileSync('/Users/zhengjiangrong/Desktop/MVApplication.java');
// let dst='/Users/zhengjiangrong/Desktop/xxx/ll/xl.java'
// fs.writeFileSync(dst, content);


// download egoist/tooling's master branch archive
// coding('weexplus/boilerplate', {target: 'boilerplate'})




// 使用 digest 方法输出摘要内容，不使用编码格式的参数 其输出的是一个Buffer对象
// console.log(md5.digest());
// 输出 <Buffer 90 01 50 98 3c d2 4f b0 d6 96 3f 7d 28 e1 7f 72>

// 使用编码格式的参数，输出的是一个字符串格式的摘要内容

// function md5(s){
//     const md5 = crypto.createHash('md5');
//
// // 往hash对象中添加摘要内容
//     md5.update(s);
//     return md5.digest('hex')
//
// }
// console.log(md5('hex'));

// let url='https://www.baidu.com'
const opn = require('open');
// var app='chrome'
// if (process.platform == 'darwin')
// {
//     app='google chrome'
// }
// // opn(url);
// app='android studio'
// app='WebStorm'
// url='/Users/zhengjiangrong/.wx/modules/node_modules/_@weex-cliebug@2.0.0-beta.29@@weex-cli'
// // url='/Users/zhengjiangrong/work/corenerstone/zhwf/wf/platforms/android/wf'
// opn(url,app);


// let url='https://github.com/farwolf2010/audio-ios.git'
// let p=url.split('/')
// let name=p[p.length-1]
// name=name.replace('.git','')
// console.log(name)
// const copy = require('copy-concurrently')
// let from ='/Users/zhengjiangrong/Desktop/ty/plugins/audio/audio/ios'
// let to ='/Users/zhengjiangrong/Desktop/ty/plugins/audio/ios'
// copy(from,to)

kill(8089)
console.log('success')


