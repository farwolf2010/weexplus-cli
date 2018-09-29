const chalk = require('chalk');
const util = require('./util.js');
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

              
                if(!t)
                {
                   t=true;
                   util.checkPort(8088,(res)=>{
                        if(!res)
                        {
                          console.log(chalk.green("weex debug未开启，开启debug！"));  
                          var exec = require('child_process').exec,
                          last = exec('weex debug');
                        }
                        else
                        {
                          console.log(chalk.red("debug 已开启，不再开启!"));  
                        }
                    })  
                   
                }
                setTimeout(function(){
                      t=false
                      //socket1.end("我结束了","utf8");
                  },500);



           
                

              
         }
         if('test'==message)
         {
                 
             if(!t1)
             {
               t1=true
               wss.clients.forEach(function each(client) {  
                    if(client!=ws) 
                    {
                                
                          console.log('');
                          client.send(test+"");                         
                       
                    }
                }); 
             }
                setTimeout(function(){
                      t1=false
                      //socket1.end("我结束了","utf8");
                  },500);
         }
         else
         {

            var reg=new RegExp("^"+'open');     
            if(reg.test(message))
            {

                    // console.log(chalk.green('通过'));
                  var url='http://localhost:8088/debug.html?channelId='+message.split('=')[1]
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
});

// console.log('socket 监听启动');
      log.info("socket 监听已启动");
//////////


  
  });
};

 
module.exports = {
  start,send
  
}; 
