const setEnv = require('../setEnv')
var inquirer = require('inquirer')
const net = require('../../../scripts/utils/net')
const utils = require('../../../scripts/utils')
const logger = require('../../../scripts/logger')

function checkRvm(op) {
    op.cstep++
    logger.warning('['+op.cstep+'/'+op.step+']  检查rvm')
    return new Promise((reslove,reject)=>{
        setEnv.doCmd('rvm -v','command not found',(res)=>{
            if(!res){
                logger.info('[✓] rvm已安装，继续下一步！');
                reslove(op)
            }
            else{
                logger.info('检测到rvm未安装，开始安装rvm！');
                utils.exec('curl -L get.rvm.io | bash -s stable ',false).then(()=>{
                    utils.exec('source ~/.bashrc',false).then(()=>{
                        utils.exec('source ~/.bash_profile',false).then(()=>{
                            setEnv.doCmd('rvm -v','command not found',(res)=>{
                                if(!res){
                                    logger.info('rvm安装成功！');
                                    reslove(op)
                                }
                            })
                        })
                    })
                })
            }
        })
    })
}

function checkBrew(op) {
    op.cstep++
    logger.warning('['+op.cstep+'/'+op.step+'] 检查brew')
    return new Promise((reslove,reject)=>{
        setEnv.doCmd('brew','command not found',(res)=>{
            if(!res){
                logger.info('[✓] brew已安装，继续下一步！');
                reslove(op)
            }
            else{
                logger.info('[✓] 检测到brew未安装，开始安装brew！');
                utils.exec("/usr/bin/ruby -e \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)\"",false
                ).then((res)=>{
                    setEnv.doCmd('brew','command not found',(res)=>{
                           if(!res){
                               logger.info('brew安装成功！');
                               reslove(op)
                           }
                    });

                })
            }
        })
    })
    
}


function checkRuby(op) {
    op.cstep++
    logger.warning('['+op.cstep+'/'+op.step+'] 检查ruby')
    return new Promise((reslove,reject)=>{
        setEnv.doCmd('ruby -v','command not found',(res)=>{
            if(!res){
                logger.info('[✓] ruby已安装，继续下一步！');
                reslove(op)
            }
            else{
                logger.info('检测到ruby未安装，开始安装ruby！');
                setEnv.getCmd('rvm list known',(res1)=>{
                    let px=res1.filter((v)=>{
                        return v.indexOf('[ruby-]')>-1
                    })
                    let max=px[px.length-1].replace('[ruby-]','').replace('-head','').replace('[','').replace(']','')
                    console.log(max)
                    utils.exec('rvm install  '+max).then(()=>{
                        setEnv.doCmd('ruby -v','command not found',(res2)=>{
                            if(!res2){
                                utils.exec('rvm use '+max+' --default').then(()=>{
                                    logger.info('[✓] ruby安装成功！');
                                    reslove(op)
                                })

                            }
                        })
                    })


                })
            }
        })
    })
}


function checkCocopod(op) {
    op.cstep++
    logger.warning('['+op.cstep+'/'+op.step+'] 检查pod命令')
    return new Promise((reslove,reject)=>{
        setEnv.doCmd('pod','command not found',(res)=>{
            if(!res){
                // reslove(op)
                setEnv.doCmd('pod search','A search query',(res2)=>{
                    if(!res2){
                        logger.info('仓库不存在，开始下载！！');
                        utils.exec('pod setup ',false).then(()=>{
                            setEnv.doCmd('pod search','A search query',(res3)=>{
                                if(res2){
                                    logger.info('[✓] cocopod环境已全部安装完毕！');
                                    reslove(op)
                                }
                            });
                        })
                    }
                    else{
                        logger.info('[✓] cocopod环境已安装，继续下一步！');
                        reslove(op)
                    }
                });
            }
            else{
                logger.info('检测到cocopod未安装，开始安装cocopod！');
                utils.exec('sudo gem install -n /usr/local/bin cocoapods ',false).then(()=>{
                    setEnv.doCmd('pod','command not found',(res1)=>{
                        if(!res1){
                            logger.info('cocopod安装成功，开始下载仓库！！');
                            logger.info('此过程比较耗时请耐心等待！！');
                            logger.info('如有中断，请执行 pod setup 自行安装！');
                            utils.exec('pod setup ',false).then(()=>{
                                setEnv.doCmd('pod search','A search query',(res2)=>{
                                     if(res2){
                                         logger.info('[✓] cocopod环境已全部安装完毕！');
                                         reslove(op)

                                     }
                                });
                            })
                        }
                    });
                })
            }
        })
    })
}


function check(op) {
  return  checkRvm(op)
        .then(checkBrew)
        .then(checkRuby)
        .then(checkCocopod)
}

module.exports={check,checkBrew,checkRuby,checkCocopod,checkRvm}