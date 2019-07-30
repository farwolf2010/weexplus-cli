// const ios=require('./scripts/run/ios')
const util = require('../../scripts/utils')
const logger = require('../../scripts/logger')
var inquirer = require('inquirer')
var fs = require('fs')
//
var exec = require('child_process').exec;


function setEnv(op){
  if(process.platform=='win32'){
      setEnvWinAsk(op)
  }
  else{
      setEnvMac(op)
  }

}
function setEnvMac({name,envName,weg,defa,validate}){
    var questions = [{
        type: 'input',
        name: 'path',
        message: "请输入"+name+"安装路径.",
        default:function () {
            if(defa)
                return defa
            return ''
        },
        validate: function (value) {
            if(value=='')
                return false
            if(validate){
              return  validate(value,defa)
            }
            return defa!=value
        }

    }]
    inquirer.prompt(questions).then((answers) => {
        let _answers = JSON.parse(JSON.stringify(answers))
        let cmd="setx  "+envName+' \"'+_answers.path+"\""
        util.exec(cmd).then(()=>{
            cmd="setx  PATH \"%PATH%;%"+envName+"%"
            if(weg){
                cmd=cmd+'\\'+weg
            }
            cmd=cmd+';'
            util.exec(cmd).then(()=>{
                check(envName,'%'+envName+'%',(res)=>{
                    console.log('设置成功，请关闭当前窗口，再重新打开！')
                })
            })
        })
    })
}
function setEnvWinAsk(param,callback){
    let name=param.name
    let envName=param.envName
    let weg=param.weg
    let defa=param.defa
    let validatex=param.validate
    var questions = [{
        type: 'input',
        name: 'path',
        message: "请输入"+name+"安装路径.",
        default:function () {
            if(defa)
            return defa
            return ''
        },
        validate: function (value) {
            if(value=='')
                return false
            if(validatex){
                return  validatex(value,defa)
            }
            return defa!=value
            // return true
        }

    }]
    inquirer.prompt(questions).then((answers) => {
        let _answers = JSON.parse(JSON.stringify(answers))
        console.log(_answers)
        console.log(_answers.path)
        setWinEnv({envName:envName,path:_answers.path,weg:weg},callback)
    })

}

function setWinEnv(p,callback) {
    let cmd="setx  "+p.envName+'  \"'+p.path+"\""
    console.log(cmd)
    util.exec(cmd).then(()=>{
        cmd="setx  PATH \"%PATH%;%"+p.envName+"%"
        if(p.weg){
            cmd=cmd+'\\'+p.weg
        }
        cmd=cmd+'\";'
        console.log(cmd)
        util.exec(cmd).then(()=>{
             logger.info('设置成功，请关闭当前窗口，再重新打开！')
            if(callback)
            callback()
        })
    })
}

function check(cmd,str,callback){
    doCmd('echo %'+cmd+'%',str,callback)
}

function doCmd(cmd,str,callback){

    let child=exec(cmd,  {encoding: 'utf8',maxBuffer: 20000*10204,timeout: 0,killSignal: 'SIGTERM',},function(err, stdout, stderr) {

        let ary= stdout.split('\n')
        if(stdout==''){
            ary=stderr.split('\n')
        }
        for(let i=0;i<ary.length;i++){
            let line=ary[i]
            var p=line.trim()
            // console.log(p)
            if(p.indexOf(str)>-1){
                callback(true)
                return;
            }
        }
        callback(false)
    });

}

function getCmd(cmd,callback){

    exec(cmd,  {encoding: 'utf8',maxBuffer: 20000*10204,timeout: 0,killSignal: 'SIGTERM',},function(err, stdout, stderr) {

        let ary= stdout.split('\n')
        if(stdout==''){
            ary=stderr.split('\n')
        }
        let px=[]
        for(let i=0;i<ary.length;i++){
            let line=ary[i]
            var p=line.trim()
            px.push(p)
        }
        callback(px)
    });

}


function setMacEnv(op) {


}


function writeMacBashProfile(op,env){
    var path=  op.macProfile
    var result=fs.readFileSync(path, 'utf8')
    // let p=util.regex('apply','def',result)
    let res=''+result
    let temp=res.split('\n')
    let out=[]
    temp.forEach((item)=>{
        if(item.indexOf(env.name)==-1){
            out.push(item)
        }
    })

    out.push('export '+env.name+'='+env.path)
    if(env.weg)
    {
        let weg=env.weg
        if(!weg){
            weg=''
        }
        if(weg.length){
            for(let i=0;i<weg.length;i++){
                let it=weg[i]
                out.push('export PATH=$'+env.name+it+':$PATH')
            }
        }else{
            out.push('export PATH=$'+env.name+weg+':$PATH')
        }


    }else{
        out.push('export PATH=$'+env.name+':$PATH')
    }




    let px=''
    out.forEach((item)=>{
        px+=item+'\n'
    })
    fs.writeFileSync(path,px,{encode:'utf-8'})
}



function checkWinWS(callback){
    check('wxp_ws','%wxp_ws%',(res)=>{
        if(res)
            setEnv({name:'webstorm',envName:'wxp_ws',weg:'\bin'})
        else{
            console.log('环境变量已设置')
            callback()
        }
    })
}

function checkWinVS(callback){
    check('wxp_vs','%wxp_vs%',(res)=>{
        if(res)
            setEnv({name:'vscode',envName:'wxp_vs'})
        else{
            console.log('环境变量已设置')
            callback()
        }
    })
}


function checkWinAS(callback){
    check('wxp_as','%wxp_as%',(res)=>{
        if(res)
            setEnv({name:'AndroidStudio',envName:'wxp_as',weg:'\bin'})
        else{
            console.log('环境变量已设置')
            callback()
        }
    })
}


module.exports={checkWinWS,checkWinVS,checkWinAS,doCmd,setEnv,getCmd,writeMacBashProfile,setWinEnv,setEnvWinAsk}