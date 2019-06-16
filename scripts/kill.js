

function killWin(port){
    // console.log('kill:'+port)
    // var cmd=process.platform=='win32'?'netstat -ano':'ps aux';
    var cmd='netstat -ano';
    var exec = require('child_process').exec;
    exec(cmd, function(err, stdout, stderr) {
        if(err){ return}
        stdout.split('\n').filter(function(line){
            var p=line.trim().split(/\s+/);
            var address=p[1];
            if(address!=undefined){
                if(address.split(':')[1]==port)
                {
                    exec('taskkill /F /pid '+p[4],function(err, stdout, stderr){
                        if(err){
                            return;
                            // return console.log('释放指定端口失败！！');
                        }
                        // console.log('占用指定端口的程序被成功杀掉！');
                    });
                }
            }
        });
    });
}



function killMac(port){
    // console.log('kill:'+port)
    try{
        var order='lsof -i :'+port;
        var exec = require('child_process').exec;
        exec(order, function(err, stdout, stderr) {
            if(err){
                return }
            stdout.split('\n').filter(function(line){
                var p=line.trim().split(/\s+/);
                var address=p[1];
                if(address!=undefined && address!="PID"){
                    // console.log('xx='+address+'')
                    exec('kill '+ address,function(err, stdout, stderr){
                        if(err){
                            return;
                        }
                    });
                }
            });
        });
    }catch(e){

    }

}


function kill(port){
  if(process.platform=='win32'){
      killWin(port)
  }else{
      killMac(port)
  }
}


module.exports={kill}