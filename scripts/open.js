const chalk = require('chalk');
const update = require('./update')
const setEnv = require('./env/setEnv')
const opn = require('open');
function open(op){
    if(!update.isRootDir()&&(op.platform=='ios'||op.platform=='android')){
        console.log(chalk.red('必须在根项目根目录操作！'));
        return;
    }
    // console.log(op)
    if(process.platform==='darwin'){
        if(op.platform=='ios'){
            openIos(op)
        }else if(op.platform=='vs'){
            let path=process.cwd()
            opn(path, 'Visual Studio Code');
        }else if(op.platform=='ws'){
            let path=process.cwd()
            opn(path, 'WebStorm');
        }
        else{
            openAndoid(op)
        }
    }else  if(process.platform==='win32'){
        if(op.platform=='vs'){
            setEnv.checkWinVS(()=>{
                let path=process.cwd()
                opn(path, 'Visual Studio Code');
            })
        }else if(op.platform=='ws'){
            setEnv.checkWinWS(()=>{
                let path=process.cwd()
                opn(path, 'WebStorm');
            })
        }
        else{

            setEnv.checkWinAS(()=>{
                openAndoid(op)
            })
        }
    }

}

function openAndoid(op){
    let path=process.cwd()
    path=path+'/platforms/android/'+op.dir
    if(process.platform=='darwin'){
        opn(path, 'android studio');
    }else if(process.platform=='win32'){
        setEnv.doCmd('java version','64',(res)=>{
            if(res){
                opn(path, "stuido.exe");
            }else{
                opn(path, "stuido64.exe");
            }
        })
    }
}

function openIos(op){
    let path=process.cwd()
    path=path+'/platforms/ios/'+op.dir+'/'+op.dir+'.xcworkspace'
    opn(path, 'xcode');
}

module.exports={open,openAndoid,openIos}