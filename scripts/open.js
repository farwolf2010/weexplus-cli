const chalk = require('chalk');
const update = require('./update')
const opn = require('open');
function open(op){
    if(!update.isRootDir()){
        console.log(chalk.red('必须在根项目根目录操作！'));
        return;
    }

    if(process.platform==='darwin'){
        if(op.platform=='ios'){
            openIos(op)
        }else{
            openAndoid(op)
        }
    }else{
        openAndoid(op)
    }

}

function openAndoid(op){
    let path=process.cwd()
    path=path+'/platforms/android/'+op.dir
    opn(path, 'android studio');
}

function openIos(op){
    let path=process.cwd()
    path=path+'/platforms/ios/'+op.dir+'/'+op.dir+'.xcworkspace'
    opn(path, 'xcode');
}

module.exports={open,openAndoid,openIos}