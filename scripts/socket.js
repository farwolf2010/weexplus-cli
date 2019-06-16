const chalk = require('chalk');
const util = require('./util.js');
const {kill} = require('./kill.js');
const log = require('./logger.js');
const send = (ip,port) => {
  return new Promise((resolve, reject) => {
    // const chalk = require('chalk');
    ////console.log(chalk.green("发送更新指令"));
      // //////////
      const WebSocket = require('ws');
      const ws = new WebSocket('ws://'+ip+':'+port);
      ws.on('open', function open() {      
             ws.send('serverrefresh');
             ws.close();
      });

  });
};

function getLogLevel(level){
    if(level=='error'){
        return 1
    }else if(level=='warn'){
        return 2
    }else{
        return 3
    }
}


const start = (_port) => {
  return new Promise((resolve, reject) => {
             

///////////

var WebSocketServer = require('ws').Server;
var client = require('ws').Client;
wss = new WebSocketServer({ port: _port });
 
wss.on('connection', function (ws) {

    // console.log(chalk.green("client connected!"));  
    //收到消息回调
    var t=false;
        var t1=false;

    ws.on('message', function (message) {
          // console.log(message+ " ==="+new Date().getTime());
         if('serverrefresh'==message)
         {


             // log.info('refresh '+Date.now())
             if(!t1)
             {
               t1=true
               wss.clients.forEach(function each(client) {  
                    if(client!=ws) 
                    {
                                
                          // console.log(client);
                          client.send('refresh');                         
                       
                    }
                }); 
             }
                setTimeout(function(){
                      t1=false
                      //socket1.end("我结束了","utf8");
                  },500);
         }
         else if('opendebug'==message)
         {

              
                // if(!t)
                // {
                //    t=true;
                //    util.checkPort(8089,(res)=>{
                //         if(!res)
                //         {
                //           console.log(chalk.green("weex debug未开启，开启debug！"));
                //           var exec = require('child_process').exec,
                //           last = exec('weex debug');
                //         }
                //         else
                //         {
                //           console.log(chalk.red("debug 已开启，不再开启!"));
                //         }
                //     })
                //
                // }
                // setTimeout(function(){
                //       t=false
                //       //socket1.end("我结束了","utf8");
                //   },500);

             var port=8089
             kill(port)
             setTimeout(()=>{
                 var exec = require('child_process').exec,
                 last = exec('weex debug --channelid 123456')
             },300)
              
         }
         else if(message.indexOf('log:')!=-1)
         {
             let level='info'
             let msg=message.replace('log:','')
             // console.log('xxxx=='+message)
             if(msg.indexOf('level:')!=-1){
                 level=msg.split('level:')[0]
                msg=msg.split('level:')[1]
                 // console.log('xxxx=='+level)
             }
             let res={}
             if(level=='error'){
                res=chalk.red(msg)
             }else if(level=='warn'){
                 res=chalk.yellow(msg)
             }
             else{
                 res=chalk.green(msg)
             }
             var path=process.cwd();
             path=path+'/configs/weexplus.json'
             var p= util.readJson(path);
             let loglevel=p.loglevel
             let logfilter=''
             if(p.logfilter){
                 logfilter=p.logfilter
             }
             // console.log('filter='+logfilter)
             // console.log('base='+getLogLevel(loglevel)+loglevel)
             // console.log('user='+getLogLevel(level)+level)
             if(getLogLevel(loglevel)>=getLogLevel(level)){
                 // console.log('xxx='+logfilter)
                 let filters=logfilter.split(',')

                 let print=false
                 filters.forEach((item)=>{
                     if(res.indexOf(item)!=-1){
                         print=true
                     }
                 })
                 // print=true
                 if(print)
                 console.log(res);
             }


         }
         else
         {

            var reg=new RegExp("^"+'open');     
            if(reg.test(message))
            {
                var ip = require('ip');
                var url='http://'+ip.address()+":"+8089+"/client/weex/"+message.split('=')[1]+'?type=weex';

                    // console.log(chalk.green('通过'));
                // http://192.168.0.102:8089/client/weex/29f3fecc-b7be-4438-a4bb-e2a0088e3ada?type=weex
                //   var url='http://localhost:8088/debug.html?channelId='+message.split('=')[1]
                  util.open(url)

            }
            else
           {
            // console.log(chalk.green('不通过'));  
           }
         }
          
         

    });

     // 退出聊天  
    ws.on('close', function(close) {  
      
        // console.log('退出连接了');  
           // console.log(chalk.red("退出连接了")); 
    });

  ws.on("error", function (code, reason) {
    console.log(chalk.red("socket 异常"+reason));
  });
});

// console.log('socket 监听启动');
      log.info("socket 监听已启动");
//////////


  
  });
};

 
module.exports = {
  start,send
  
}; 
