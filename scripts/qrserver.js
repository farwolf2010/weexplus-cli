const server = require('./server')
var util=require('./util.js')
const proxy = require('./proxy')

function start(dist,distport)
{


     //开启总页面
	  var serverport=9887;
	  var proxyport=8890;
	  if(distport==undefined)
	  	distport=9999
      let sp='weexplus'
      if(__dirname.indexOf('weexplus-cli')!=-1){
	      sp='weexplus-cli'
      }
	  var path=__dirname.split(sp)[0]+sp+'/assets'
	  server.start(path,serverport,false);
      server.start(dist,distport,false);

     var ip = require('ip');
     var url='http://'+ip.address()+":"+serverport+"/";
     var disturl='http://'+ip.address()+":"+distport+"/";

     var proxypageurl='http://'+ip.address()+":"+proxyport+"/pages/";
     proxy.doProxy([{from:'pages',to:url},{from:'js',to:disturl}],proxyport)



     util.open(proxypageurl)
    
}
module.exports={start}