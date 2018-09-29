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
const proxy = require('./scripts/proxy')
const qrserver = require('./scripts/qrserver')
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


     
      watch.start('./src/img',true,function(){  
       // console.log('img change')
       //  console.log(chalk.green("img 同步!"));
          log.info("img 同步!");
       file.del('dist/img')
       file.mkdir('dist/img')
       file.copy('./src/img','./dist/img')
      
      });

        watch.start('./src/font',true,function(){  
       // console.log('img change')
            log.info("font 同步!");
       file.del('dist/font')
       file.mkdir('dist/font')
       file.copy('./src/font','./dist/font')
      
      });


         watch.start('./src/file',true,function(){  
       // console.log('img change')
             log.info("file 同步!");
       file.del('dist/file')
       file.mkdir('dist/file')
       file.copy('./src/file','./dist/file')
      
      });
  
 
      watch.start('./configs/weexplus.json',false,function(){
          console.log(chalk.green("weexplus.json 同步!"));
          file.copy('./configs/weexplus.json','./platforms/android/'+dir+'/app/src/main/assets/app/weexplus.json')
          file.copy('./configs/weexplus.json','./platforms/ios/'+dir+'/app/weexplus.json')
      });


      log.info("img 同步!");
       file.del('dist/img')
       file.mkdir('dist/img')
       file.copy('./src/img','./dist/img')


      log.info("font 同步!");
       file.del('dist/font')
       file.mkdir('dist/font')
       file.copy('./src/font','./dist/font')

      log.info("file 同步!");
       file.del('dist/file')
       file.mkdir('dist/file')
       file.copy('./src/file','./dist/file')
        
        install(dir);
        
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
       file.copy('./src/img','./dist/img')


      log.info("font 同步!")
       file.del('dist/font')
       file.mkdir('dist/font')
       file.copy('./src/font','./dist/font')


       log.info("file 同步!");
       file.del('dist/file')
       file.mkdir('dist/file')
       file.copy('./src/file','./dist/file')
        
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
  .description('更新weexplus')
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


// program
//   .command('dev')
//   .description('更新weexplus')
//   .action(() => {
//        utils.exec('npm run dev')
//   })

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


   program
    .command('test')
    .action(() => {
        server.readAppboard();
    })




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

