 
var express = require('express');
var proxy = require('http-proxy-middleware');
const update = require('./update')
const util = require('./util')
 const chalk = require('chalk');

function doProxy(locations,port)
{  
    
    var app = express();
    locations.forEach((item,index)=>{    
          app.use('/'+item.from, createProxy(item));  
    })
  
    app.listen(port);
}


function createProxy( p)
{
    var rewrite={}
    rewrite['^/'+p.from+'/']='/'


    var router={};
     router['/'+p.from+'']=p.to
    var options = {
            target: p.to, // target host 
            changeOrigin: true,               // needed for virtual hosted sites 
            ws: true,                         // proxy websockets 
            pathRewrite:rewrite,
            router:router

        };
     
     return proxy(options);
}

function doProxys(locations)
{ 
    locations.forEach((item,index)=>{    
            doProxy(item.locations,item.port)
    })
}



function doAll(from,to,port,option)
{
    if(option.path==undefined)
      {
           if(from!=undefined&&to!=undefined&&port!=undefined)
           {
              var locations=[]
              locations[0]={from:from,to:to}
               doProxy(locations,port)
           }
           else
           {
               if(!update.isRootDir())
               {
                 console.log(chalk.red('没有指定weexplus.json的路径！'));
                 return;
               } 
              var path=process.cwd();
              path=path+'/configs/weexplus.json'
              var p= util.readJson(path);
              if(p.proxys==undefined)
                {
                     console.log(chalk.red('配置文件格式不正确！')); 
                     return 
                }
                doProxys(p.proxys);
           }
      }
      else
      {
            
            var p= util.readJson(option.path);
            // console.log(p)
            if(p.proxys==undefined)
            {
                 console.log(chalk.red('配置文件格式不正确！')); 
                 return 
            }
            doProxys(p.proxys);
           
      }
       console.log(chalk.green('反向代理已启动')); 
}

 
// doProxy([{from:'api',to:'http://59.110.169.246/'},{from:'api1',to:'http://www1.1chemic.com/'}],9090)
 module.exports={doProxy,doProxys,doAll}


