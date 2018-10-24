 
const chalk = require('chalk');
const logger=require('./logger')

 
 
//  var file2 = path.resolve('/test1/two.txt');  
// fs.watchFile(file2,  function(curr, prev) {  
//     console.log('这是第二个watch，监视文件有修改');  
// });

function excute(cmd)
{
   var exec = require('child_process').exec,
    last = exec(cmd);
}

 function checkPort(port,callback)
 {

 	var net = require('net')

 
  // 创建服务并监听该端口
  var server = net.createServer().listen(port)

  server.on('listening', function () { // 执行这块代码说明端口未被占用
    server.close() // 关闭服务
    callback(false)
    // console.log('The port【' + port + '】 is available.') // 控制台输出信息
  })

  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') { // 端口已经被使用
      // console.log('The port【' + port + '】 is occupied, please change other port.')
      callback(true)
    }
  })


 }

 function open(url)
 {
     
      
      // console.log(chalk.red(process.platform)); 
      if (process.platform == 'linux')
      {
         
          excute('google-chrome ' + url);
          return;
      }

      const opn = require('open'); 
      var app='chrome'
       if (process.platform == 'darwin')
      {
         app='google chrome'
      }
     opn(url, app);
 }


 function readJson(jsonpath)
 {
    var fs=require('fs');
    var file=jsonpath;
    var result=JSON.parse(fs.readFileSync(file, 'utf8'));
    return result;
 }
function readProperties(path)
{
  var fs=require('fs');
  var file=path;
  var result=fs.readFileSync(file, 'utf8')
  let p=result.split('\n')
  let res={}
  p.forEach((it)=>{
    let q=it.split('=')
    res[q[0]]=q[1]
  })
  return res;
}

 function config()
 {
     var fs=require('fs');
     var path=process.cwd();
     path=path+'/configs/weexplus.json'
     return readJson(path)
 }

function isRootDir()
{
    var fs=require('fs');
    var path=process.cwd();
    path=path+'/configs/weexplus.json'
    return fs.existsSync(path);
}
 
module.exports = {
  checkPort,excute,open,readJson,isRootDir,config,readProperties
  
};