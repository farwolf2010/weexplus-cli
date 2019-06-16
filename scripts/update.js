 const file = require('./file')
const chalk = require('chalk');
const copy = require('copy-concurrently')

	 function backandroid(src,callback)
	 {
	 		var fs=require('fs');
		 	 
		 	var path=process.cwd();
		 	var px=require('path')
		 	var q=path.split(px.sep)
		 	var dir=q[q.length-1]
			// console.log(dir)
			var backdir=path+'/platforms/android/备份/'
			if(!fs.existsSync(backdir))
			{
		       file.mkdir(backdir)
			}
			else
			{
				file.del(backdir)
				file.mkdir(backdir)
			}
			
		     // console.log('dsdsd='+path+'/platforms/android/')
		     var s='farwolf,farwolf.weex,farwolf.business,sdk,galleryfinal'
			 fs.readdir(path+'/platforms/android/',function(err,paths){
		        var count=0;
		        paths.forEach(function(px,index){

                          // console.log(index)
                        var  fpath=path+'/platforms/android/'
                      		        	 
		        	   
		        	   if(px!=dir&&px!='备份'&&px!='.DS_Store'&&px!='key.store'&&s.indexOf(px)!=-1)
		                  {

		                  
		                  	 file.del(backdir+px)
		                  	 copy(fpath+px,backdir+px).then(() => {
								  // this is now copied
								    file.del(fpath+px)
				                     // file.mkdir(fpath+px)
				                     var source=path+'/boilerplate/platforms/android/'
				                     if(src!=undefined)
				                     {
				                     	source=src+'/platforms/android/'
				                     }
				                    
				                  	 copy(source+px,fpath+px).then(()=>{
				                  	 	   console.log('更新android:'+(count+1)+'/'+paths.length);
                                            count++;
                                            if(count>=paths.length)
                                            {
                                                callback();
                                            }
				                  	 })
								}).catch(err => {
								  // oh noooo
								   console.log(err)
								})
		                   
		                     

		                  }
		                  else
		                  {
		                  	console.log('更新android:'+(count+1)+'/'+paths.length);
		                  	count++;
		                  }
		                    
		                   
		            });
		        });
	 }

      function isRootDir()
      {
      	   var fs=require('fs');
		  var path=process.cwd();
		  path=path+'/configs/weexplus.json'
		   return fs.existsSync(path);
      }


      function start(src)
      {
      	  if(!isRootDir())
      	  {
      	  	  console.log(chalk.red('必须在根项目根目录操作！')); 
      	  	return;
      	  }
          if(src!=undefined)
          {
                
  	             backandroid(src,()=>{
		        	backios(src,()=>{
		        		console.log(chalk.green("更新完毕!"));
		        	});
		        });
          	    return;
          }
          deldownload();
          const downloadRepo = require('download-repo')
		  downloadRepo('weexplus/boilerplate', {target: 'boilerplate'})
		  .then(() => {
		    // console.log('done, `cd tooling` to check out more!')
		        var path=process.cwd()+'/boilerplate';
		        var fs = require("fs"); 
                var stat=fs.stat;
                stat(path,function(err,st){
		                if(err){
		                    console.log('模板下载失败，放弃更新!')
		                    return;
		                }		           
		                if(st.isDirectory()){
                            
		                      backandroid(src,()=>{
						        	backios(src,()=>{
						        		deldownload();
						        		console.log(chalk.green("更新完毕!"));
						        	});
						        });
		                }
		            });
		      
  	             
  	              
  	            
		  })


      	 
      	  	
      }

      function deldownload()
      {   
      

      	  
		           var fs=require('fs');
				   var path=process.cwd();
				   file.del(path+'/boilerplate')
				    
      	  
            
      }
     

	 function backios(src,callback)
	 {

            var fs=require('fs');
            var px=require('path')
		 	var path=process.cwd();
		 	var q=path.split(px.sep)
		 	var dir=q[q.length-1]
			// console.log(dir)
			var backdir=path+'/platforms/ios/'+dir+'/备份/'
			if(!fs.existsSync(backdir))
			{
		       file.mkdir(backdir)
			}
			else
			{
				file.del(backdir)
				file.mkdir(backdir)
			}
			
		      
           var s='farwolf,farwolf.weex,farwolf.business,sdk,LMTowDatePicker,WXDevtool'
	 	    fs.readdir(path+'/platforms/ios/'+dir+'/',function(err,paths){
        
             var count=0
             paths.forEach(function(px,index){
        	  var  fpath=path+'/platforms/ios/'+dir+'/'
        	 
        	   if(px!=dir&&px!='app'&&px!='.DS_Store'&&px!='Pods'&&px!=dir+'.xcworkspace'&&px!=dir+'.xcodeproj'&&px!='Podfile.lock'&&s.indexOf(px)!=-1)
                  {
                  	 // console.log(fpath+px)
                  	 file.del(backdir+px)
                      copy(fpath+px,backdir+px).then(() => {
						  // this is now copied
						    file.del(fpath+px)
		                     // file.mkdir(fpath+px)
		                     var source=path+'/boilerplate/platforms/ios/weexplus/'
		                     if(src!=undefined)
		                     {
		                     	source=src+'/platforms/ios/weexplus/'
		                     }
		                    
		                  	 copy(source+px,fpath+px).then(()=>{
		                  	 	 console.log('更新ios:'+(count+1)+'/'+paths.length);
                                    count++;
                                    if(count>=paths.length)
                                    {
                                        callback();
                                    }

		                  	 })
						}).catch(err => {
						  // oh noooo
						   console.log(err)
						})

                  }
                  else
                  {
                  	 console.log('更新ios:'+(count+1)+'/'+paths.length);
                  	count++;
                  }
               
               });
            });
	 }


 


 module.exports = {
  
  start,isRootDir
};
    