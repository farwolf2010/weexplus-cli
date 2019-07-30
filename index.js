#!/usr/bin/env node
 const chalk = require('chalk');
const program = require('commander')
const inquirer = require('inquirer')
const rimraf = require('rimraf')
const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')
const server = require('./scripts/server')
const create = require('./scripts/create')
const log = require('./scripts/logger')
const watch = require('./scripts/watch')
const socket = require('./scripts/socket')
const file = require('./scripts/file')
const update = require('./scripts/update')
const clone = require('./scripts/clone')
const run = require('./scripts/run/run')
const android=require('./scripts/run/android')
const ios=require('./scripts/run/ios')
const utils = require('./scripts/utils')
const util = require('./scripts/util')
const open = require('./scripts/open')
const proxy = require('./scripts/proxy')
const qrserver = require('./scripts/qrserver')
const plugin = require('./scripts/plugin')
const {kill} = require('./scripts/kill.js');
const hotupdate = require('./scripts/hotupdate.js');
const env = require('./scripts/env/index');
var cp = require('child_process');
var p=require('path')
const HOST='127.0.0.1'
const SOCKET_PORT=9897
program
  .version(pkg.version)

program
  .command('start')
  .option('--dir [value]','文件夹名，默认weexplus')
  .option('--socketport [value]','热更新端口默认:9897')
  .option('--serverport [value]','热更新端口默认:9999')
   .option('--qr [value]','显示二维码')
  .description('启动weexplus监听')
  .action((option) => {
      if(!update.isRootDir())
      {
          log.fatal(chalk.green('请在根目录执行此命令'));
          return;
      }
      var dir=option.dir
      var socketport=option.socketport
      var serverport=option.serverport
     if(dir==undefined)
     {
          
         var path=process.cwd();
         dir=p.basename(path)
     }
     if(socketport==undefined)
     {
       socketport=9897
     }
     if(serverport==undefined)
     {
        serverport=9999
     }
     // cp.exec('npm run dev', function () {
          //           });

      log.info(chalk.green("启动weexplusx监听 dir:"+dir+" serverport:"+serverport+" socketport:"+socketport));
     socket.start(socketport);
     
     fs.exists('dist',(res)=>{
         if(res)
         {
                 // server.start('./dist/',serverport);
                 if(option.qr==undefined)
                 {
                    qrserver.start('./dist/',serverport)
                 }
                 else
                 {
                    server.start('./dist/',serverport);
                 }
             
			       watch.start('./dist',true,function(){
        
             // console.log('dist change'+ " ==="+new Date().getTime());
			     	  socket.send(HOST,socketport)
			       });
         }
         else
     	 {
				   fs.mkdir('dist',function(){//创建目录
                         // server.start('./dist/',serverport);
                         if(option.qr==undefined)
                         {
                            qrserver.start('./dist/',serverport)
                         }
                         else
                         {
                            server.start('./dist/',serverport);
                         }
                          watch.start('./dist',true,function(){
                             socket.send(HOST,socketport)
                          });

                })
     	 }

     })


     
      watch.start('./src/native/img',true,function(){
       // console.log('img change')
       //  console.log(chalk.green("img 同步!"));
          log.info("img 同步!");
       file.del('dist/img')
       file.mkdir('dist/img')
       file.copy('./src/native/img','./dist/img')
      
      });

        watch.start('./src/native/font',true,function(){
       // console.log('img change')
            log.info("font 同步!");
       file.del('dist/font')
       file.mkdir('dist/font')
       file.copy('./src/native/font','./dist/font')
      
      });


         watch.start('./src/native/file',true,function(){
       // console.log('img change')
             log.info("file 同步!");
       file.del('dist/file')
       file.mkdir('dist/file')
       file.copy('./src/native/file','./dist/file')
      
      });

    watch.start('./src/web',true,function(){
      // console.log('img change')
      log.info("web 同步!");
      file.del('dist/web')
      file.mkdir('dist/web')
      file.copy('./src/web','./dist/web')

    });
 
      watch.start('./configs/weexplus.json',false,function(){
          console.log(chalk.green("weexplus.json 同步!"));
          file.copy('./configs/weexplus.json','./platforms/android/'+dir+'/app/src/main/assets/app/weexplus.json')
          file.copy('./configs/weexplus.json','./platforms/ios/'+dir+'/app/weexplus.json')
      });


      log.info("img 同步!");
       file.del('dist/img')
       file.mkdir('dist/img')
       file.copy('./src/native/img','./dist/img')


      log.info("font 同步!");
       file.del('dist/font')
       file.mkdir('dist/font')
       file.copy('./src/native/font','./dist/font')

      log.info("file 同步!");
       file.del('dist/file')
       file.mkdir('dist/file')
       file.copy('./src/native/file','./dist/file')

      log.info("web 同步!");
      file.del('dist/web')
      file.mkdir('dist/web')
      file.copy('./src/web','./dist/web')

        install(dir);
    var ip = require('ip');
    log.info(chalk.green("如果没有弹出浏览器,请手动打开此地址：" + 'http://' + ip.address() + ":8890/pages/"));

    // console.log('[' + chalk.green('weexplus') + '] . 服务运行在此地址', '', chalk.green( 'http://' + ip.address() + ":8890/pages"))
        // utils.exec('npm run dev')
      
  })

program
  .command('copy [dir]')
  .description('同步js文件到native')
  .action((dir) => {
    if(dir==undefined)
      {
          
         var path=process.cwd();
         dir=p.basename(path)
      }
      if(!update.isRootDir())
      {
         console.log(chalk.red('必须在根项目根目录操作！')); 
         return;
        
      }


      log.info("img 同步!")
       file.del('dist/img')
       file.mkdir('dist/img')
       file.copy('./src/native/img','./dist/img')


      log.info("font 同步!")
       file.del('dist/font')
       file.mkdir('dist/font')
       file.copy('./src/native/font','./dist/font')


       log.info("file 同步!");
       file.del('dist/file')
       file.mkdir('dist/file')
       file.copy('./src/native/file','./dist/file')
        
        install(dir);

  })

program
  .command('install [dir]')
  .description('压缩js并同步js文件到native')
  .action((dir) => {
      if(dir==undefined)
      {
          
         var path=process.cwd();
         dir=p.basename(path)
      }
      if(!update.isRootDir())
      {
         console.log(chalk.red('必须在根项目根目录操作！')); 
         return;
        
      }
 

      utils.exec('npm run build')
      .then(()=>{
          install(dir)
      })
     // sr.start('./dist/');
  })

  program
  .command('update [src]')
  .description('更新weexplus原生项目')
  .action((src) => {
       update.start(src)
  })

  program
  .command('server')
   .arguments('[path] [port] ')
  .description('开启静态服务')
  .action((path,port) => {
  	if(path==undefined)
  		path='./'
  	if(port==undefined)
  		port=9899
       // server.start(path,port);
        qrserver.start(path,port)
  })


program
  .command('zip')
  .description('制作热更新zip包')
  .action(() => {
      // hotupdate.zip()
      hotupdate.make()
  })

program
  .command('publish <platform>')
  .description('生成最终apk或者ipa')
  .action((platform) => {
       
          
        var path=process.cwd();
         dir=p.basename(path)
        if(!update.isRootDir())
        {
           console.log(chalk.red('必须在根项目根目录操作！')); 
           return;
        
        }
        if(platform=='android')
        {
          android.publish({dir:dir})
        }
        else if(platform=='ios')
        {
            ios.runIOS({dir:dir})
        }
       
     // sr.start('./dist/');
  })


  program
  .command('run <platform>')
   .option('--dir [value]','文件夹名，默认weexplus')
  .description('启动平台')
  .action((platform,option) => {
       if(option.dir==undefined)
      {
          
           var path=process.cwd();
         option.dir=p.basename(path)
         
      }
      if(!update.isRootDir())
      {
         console.log(chalk.red('必须在根项目根目录操作！')); 
         return;
        
      }
      run.run(platform,option);
     // sr.start('./dist/');
  })

   program
  .command('proxy')
  .arguments('[from] [to] [port]')
  .option('--path [value]','配置文件，默认config/weexplus.json')
  .description('开启反向代理')
  .action((from,to,port,option) => {

      proxy.doAll(from,to,port,option)
       
  })



 

 

 


  program
  .command('create')
  .description('生成新的weexplus项目')
  .action(() => {
      create.makeProject();
  })


   // program
   //  .command('test')
   //  .action(() => {
   //      server.readAppboard();
   //  })




  program
  .command('rename')
  .arguments('<project> <appid> <name>')
  .description('给工程改名字')
  .action((project,appid,name) => {
      
     // sr.start('./dist/');
     if(appid.split('.').length!=3)
     {
         
         console.log(chalk.red('请输入合法的appid，格式xxx.xxx.xxx例如(com.baidu.app)')); 
         return;
     }
     clone.renameProject(project,appid,name)
  })


program
.command('plugin')
.arguments('<command> <url>')
.description('添加(add url),删除(remove name),创建(create name),发布(publish name) 插件')
.option('--i [value]','只改ios插件')
.option('--a [value]','只改android插件')
.option('--tag [value]','插件版本')
.action((command,url,option) => {
    if(!update.isRootDir())
    {
        console.log(chalk.red('必须在根项目根目录操作！'));
        return;

    }
  var path=process.cwd();
  var dir=p.basename(path)
  let op={}
  op.url=url
  op.dir=dir
    op.pluginsDir=path+'/plugins/plugins.json'
  if(option.tag)
    op.tag=option.tag
  let platform='all'
  if(option.i&&option.a){
    platform='all'
  }else{
    if(option.i){
      platform='ios'
    }
    if(option.a){
      platform='android'
    }
  }
  op.platform=platform
  if(command=='add'){
    plugin.addNew(op)
  }else  if(command=='remove'){
      op.name=url
    plugin.removeNew(op)
  }else  if(command=='create'){
      op.name=url
      plugin.make(op)
  }else  if(command=='publish'){
      op.name=url
      plugin.publish(op)
  }
})

program
    .command('open')
    .arguments('<platform>')
    // .option('--i [value]','打开ios项目,不传默认打开android')
    // .option('--a [value]','打开android项目')
    .description('打开原生工程')
    .action((platform) => {
        // console.log(platform)
        let op={}
        var path=process.cwd();
        var dir=p.basename(path)
        op.dir=dir
        // if(platform=='ios')
        // op.platform='ios'
        op.platform=platform
        if(op.platform===''){
            op.platform='android'
        }

        open.open(op)
    })

// program
// .command('info')
// .arguments('<name>')
// .description('查看插件信息')
// .action((name) => {
//   plugin.getInfo({name:name},(res)=>{
//     if(res.err_code!=0){
//       log.fatal('没有这个插件')
//     }
//     log.info('ios:'+res.ios_url)
//     log.info('android:'+res.ios_url)
//   })
// })

program
    .command('doc')
    .description('打开weexplus文档')
    .action((name) => {
        opn = require('open');
        opn('https://weexplus.github.io/doc/quickstart/')
    })


program
    .command('env' )
    .option('--platform [value]','平台（android,ios）')
    .description('自动配置开发环境')
    .action((option) => {
        let sys='all'
        if(option.platform)
        {
          sys=option.platform
        }
        env.check({platform:sys})
    })

program
    .command('debug')
    .description('开启debug')
    .action((name) => {
        var port=8089

        kill(port)
        setTimeout(()=>{
            utils.exec('weex debug --channelid 123456',false).then(()=>{
                utils.exec('open google')
            })
        },300)
    })



program
    .command('video')
    .description('打开weexplus视频')
    .action((name) => {
        opn = require('open');
        opn('https://i.youku.com/i/UNTc4OTg0OTYxMg==?spm=a2hzp.8244740.0.0&previewpage=1')
    })



function startClone (targetDir,project,appid,name) {
  // fs.mkdirSync(targetDir)
   file.del(targetDir)
   clone.download(project,appid,name);

}


function install(dir)
{
    file.del('./platforms/android/'+dir+'/app/src/main/assets/app')
    file.del('./platforms/ios/'+dir+'/app')
    file.mkdir('platforms/android/'+dir+'/app/src/main/assets/app')
    file.mkdir('platforms/ios/'+dir+'/app')
    file.copy('./dist','./platforms/android/'+dir+'/app/src/main/assets/app')
    file.copy('./dist','./platforms/ios/'+dir+'/app')
    file.copyFile('./configs/weexplus.json','./platforms/android/'+dir+'/app/src/main/assets/app/weexplus.json')
    file.copyFile('./configs/weexplus.json','./platforms/ios/'+dir+'/app/weexplus.json')
    log.info('同步完毕!')
     
}


function mkdirsSync (dirpath) { 
    try
    {
        if (!fs.existsSync(dirpath)) {
            let pathtmp;
            dirpath.split(/[/\\]/).forEach(function (dirname) {  //这里指用/ 或\ 都可以分隔目录  如  linux的/usr/local/services   和windows的 d:\temp\aaaa
                if (pathtmp) {
                    pathtmp = path.join(pathtmp, dirname);
                }
                else {
                    pathtmp = dirname;
                }
                if (!fs.existsSync(pathtmp)) {
                    if (!fs.mkdirSync(pathtmp, 0777)) {
                        return false;
                    }
                }
            });
        }
        return true; 
    }catch(e)
    {
        log.fatal("create director fail! path=" + dirpath +" errorMsg:" + e);
        return false;
    }
} 
  
 

 

program.parse(process.argv)
module.exports={file}

