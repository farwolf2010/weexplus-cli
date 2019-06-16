let android =require('./android')
let ios =require('./ios')
let create =require('./create')
let _publish =require('./publish')
const net=require('../utils/net')
let base=net.base

function addNew(op){
    create.add(op)
}

function removeNew(op){
    create.remove(op)
}
function add(op){
  getInfo(op,(res)=>{

    if(op.platform=='all'){
      if(res.ios_url!==''&&res.android_url!==''){
        op.callback=()=>{
          if(res.ios_url!==''){
            ios.add(op)
          }
        }
        android.add(op)
      }else {
        if(res.ios_url!==''){
          log.info('只检测到ios端插件，开始安装！')
          ios.add(op)
        }
        if(res.android_url!==''){
          log.info('只检测到android端插件，开始安装！')
          android.add(op)
        }
      }
    }
    else if(op.platform=='android'){
      if(res.android_url!==''){
        android.add(op)
      }else{
        log.fatal('未检测到android端插件，无法安装！')
      }
    }
    else if(op.platform=='ios'){
      if(res.ios_url!==''){
        ios.add(op)
      }else{
        log.fatal('未检测到ios端插件，无法安装！')
      }
    }


  })
}


function make(op){
     op.url='farwolf2010/plugin-template'
     create.create(op)
}

function remove(op){
  if(op.platform=='all'){
    android.remove(op)
    ios.remove(op)
  }
  else if(op.platform=='android'){
    android.remove(op)
  }
  else if(op.platform=='ios'){
    ios.remove(op)
  }


}


function publish(op){
    _publish.excute(op)
}

function getInfo(op,callback){
  net.post(base+'plugin.do',{name:op.name} , {} ,(res)=>{
       let p=JSON.parse(res).plugin;
       let out=  Object.assign(op,p)
       callback(out)
  })
}

module.exports={add,remove,getInfo,make,removeNew,addNew,publish}