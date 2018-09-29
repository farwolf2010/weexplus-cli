
var replace = require("replace");
var fs=require('fs');
const file = require('./file')
const utils = require('./utils')
const ios = require('./run/ios.js')
function download(dir,appid,name){

  const downloadRepo = require('download-repo')
  // download egoist/tooling's master branch archive
  downloadRepo('weexplus/boilerplate', {target: 'boilerplate'})
  .then(() => {
    // console.log('done, `cd tooling` to check out more!')
      
      fs.renameSync('boilerplate',dir)
      renameAll(dir,appid,name)

     
      
  })


}


function renameProject(project,appid,name)
{

       if (!fs.existsSync('boilerplate-master'))
       {
            console.log(chalk.red('当前目录下没有发现boilerplate-master文件夹')); 
            return;
       }
      fs.renameSync('boilerplate-master',project)
      renameAll(project,appid,name)
}


function podinstall(dir)
{
    var os=require('os')
    if(os.platform()!='darwin')
    {
          console.log('创建成功')
         return;
    }

    var path=dir+'/platforms/ios/'+dir;
    const rootPath = process.cwd()
    // change working directory to ios
    // console.log('path==='+rootPath+'/platforms/ios/'+dir)
    process.chdir(path)
    utils.exec('pod install').then(()=>{
      console.log('创建成功')
    })

}

function rename(dir,name)
{
  // console.log('name='+name)
    var path=dir+'/platforms/ios/'+dir+'/'+dir+'/Info.plist'
    replace({
        regex: "weexplus",
        replacement: name,
        paths: [path],
        recursive: true,
        silent: true,
      });
    path=dir+'/platforms/android/'+dir+'/app/src/main/res/values/strings.xml'
    replace({
        regex: "weexplus",
        replacement: name,
        paths: [path],
        recursive: true,
        silent: true,
      });

}

function renameAll(dir,appid,name)
{
     renameAndroidAppId(dir,appid)
     renameAndroidDir(dir,appid)
     renameIos(dir,appid)
     setTimeout(()=>{

           rename(dir,name)
           setTimeout(()=>{
                podinstall(dir)
           },1000)
           
         
     },300);
     
      
}

function install(dir)
{
   process.chdir(dir);
   utils.exec('npm install').then(()=>{
      podinstall(dir)
   })
}

function renameAndroidAppId(dir,appid)
{
      var pathjava=dir+'/platforms/android/weexplus/app/src/main/java/com/farwolf/weexplus/MVApplication.java'
      var pathxml=dir+'/platforms/android/weexplus/app/src/main/AndroidManifest.xml'
      var gradle=dir+'/platforms/android/weexplus/app/build.gradle'
      replace({
        regex: "com.farwolf.weexplus",
        replacement: appid,
        paths: [pathjava,pathxml,gradle],
        recursive: true,
        silent: true,
      });
}


function renameAndroidDir(dir,appid)
{
      var path=dir+'/platforms/android/weexplus/app/src/main/java/'
      var q=appid.split('.')
           
      fs.rename(path+'com',path+q[0],()=>{
         
             path=path+'/'+q[0]+'/'
             fs.rename(path+'farwolf',path+q[1],()=>{
                 path=path+'/'+q[1]+'/'

                 fs.rename(path+'weexplus',path+q[2],()=>{
                       
                          var propath=dir+'/platforms/android/weexplus'
                           fs.rename(propath,dir+'/platforms/android/'+dir,()=>{
                                  
                                  file.del(dir+'/platforms/android/'+dir+'/.idea')

                           })
                  })

            })

      })

}


function renameIos(dir,appid)
{
      var path=dir+'/platforms/ios/weexplus/weexplus.xcodeproj/project.pbxproj'
       // console.log(path)
      replace({
        regex: "com.farwolf.weexplus",
        replacement: appid,
        paths: [path],
        recursive: true,
        silent: true,
      });

      replace({
        regex: "weexplus",
        replacement: dir,
        paths: [path],
        recursive: true,
        silent: true,
      });

        replace({
        regex: "weexplus",
        replacement: dir,
        paths: [dir+'/platforms/ios/weexplus/Podfile'],
        recursive: true,
        silent: true,
       });

      path=dir+'/platforms/ios/weexplus/weexplus.xcodeproj/xcshareddata/xcschemes/weexplus.xcscheme'
      replace({
        regex: "weexplus",
        replacement: dir,
        paths: [path],
        recursive: true,
        silent: true,
      });

       replace({
        regex: "weexplus",
        replacement: dir,
        paths: [dir+'/platforms/ios/weexplus/weexplus.xcworkspace/contents.xcworkspacedata'],
        recursive: true,
        silent: true,
      });

      
      // file.del(dir+'/platforms/ios/weexplus/Podfile.lock')
      // file.del(dir+'/platforms/ios/weexplus/Pods')
      // file.del(dir+'/platforms/ios/weexplus/weexplus.xcworkspace')
      fs.renameSync(dir+'/platforms/ios/weexplus/weexplus.xcworkspace', dir+'/platforms/ios/weexplus/'+dir+'.xcworkspace');
      fs.renameSync(dir+'/platforms/ios/weexplus/weexplus',dir+'/platforms/ios/weexplus/'+dir)       
      fs.renameSync(dir+'/platforms/ios/weexplus',dir+'/platforms/ios/'+dir)
      fs.renameSync(dir+'/platforms/ios/'+dir+'/weexplus.xcodeproj/xcshareddata/xcschemes/weexplus.xcscheme',dir+'/platforms/ios/'+dir+'/weexplus.xcodeproj/xcshareddata/xcschemes/'+dir+'.xcscheme')
      fs.renameSync(dir+'/platforms/ios/'+dir+'/weexplus.xcodeproj',dir+'/platforms/ios/'+dir+'/'+dir+'.xcodeproj')

      // ios.podInstall({dir:dir})
      


}



module.exports = {
  download,renameAndroidAppId,renameAndroidDir,renameIos,renameAll,rename,renameProject
  
};







 
