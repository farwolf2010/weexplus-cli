 
const chalk = require('chalk'); 
const fs = require('fs'); 
const file = require('./file')
 
 
//  var file2 = path.resolve('/test1/two.txt');  
// fs.watchFile(file2,  function(curr, prev) {  
//     console.log('这是第二个watch，监视文件有修改');  
// });




const start = (path,isdirectory,callback) => {
  return new Promise((resolve, reject) => {
               // console.log(path.substring(2))
               if(isdirectory)
               {
	               	 fs.exists(path.substring(2),(res)=>{
				         if(res)
				         {
				             startwatch(path,callback) 
				         }
				         else
				     	 {
				     	 	 file.mkdir(path.substring(2))
							 startwatch(path,callback) 
					     }
	     	         })
               }
               else
               {
           	        fs.exists(path.substring(2),(res)=>{
				         if(res)
				         {
				             startwatch(path,callback) 
				         }
				         else
				     	 {
				     	 	  

								try {
								   fs.writeFile(path.substring(2),'{"schema":"","debug":true,"debugIp":"192.168.12.153","entry":"app/index.js","preload":[],"splash":"splash","static":{"umeng":{"ios":{"appkey":""},"android":{"appkey":""}}},"platform":{"wx":{"appkey":"","appsecret":""},"qq":{"appkey":"","appsecret":""},"weibo":{"appkey":"","appsecret":"","url":""}}}',{flag:'w',encoding:'utf-8',mode:'07777'},function(err){
																	     if(err){
																	         console.log("文件写入失败")
																	     }else{
																	         console.log("文件写入成功");
									                                       
																	     }

																	}) 
								}
								catch(err) {
								    
								} 
								finally {

								      // startwatch(path,callback) 
								}

				     	 	
				     	 	   setTimeout(function(){
				     	 	   	// console.log('dsdsdsdsdsd')
					             startwatch(path,callback) 
					           },3000);


				     	 	 
							 
					     }
     	            })
               }
             

     })

               // console.log(chalk.green("开启文件监听")); 
		
           
  };

function startwatch(path,callback)
{
	  var t=false;
                var watch = require('node-watch');
				watch(path, { recursive: true }, function(evt, name) {
				    // console.log('%s changed.', name);

                      if(!t)
				        {
				        	callback();
				        	t=true;
				        }
				        setTimeout(function(){
					            t=false
					            //socket1.end("我结束了","utf8");
					        },100);


				});
}

 
module.exports = {
  start
  
};