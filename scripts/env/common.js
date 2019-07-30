const setEnv = require('./setEnv')
var inquirer = require('inquirer')
const net = require('../../scripts/utils/net')
const utils = require('../../scripts/utils')
const logger = require('../../scripts/logger')
const download = require('../../scripts/download')
const MACsetJavaHome = require('../../scripts/env/mac/setJavaHome')
var open=require('open')
var fs=require('fs')
function getEnv(){
    return new Promise((resolve,reject)=>{
        getUserHome((res)=>{
            let p={}
            p.arch=process.arch
            p.cstep=0
            p.userPath=res[0]
            p.macProfile=res[0]+'/.bash_profile'
            p.sys=process.platform
            logger.info('获取配置中...')
            net.post('https://raw.githubusercontent.com/farwolf2010/plusconfig/master/cli.json',{},{},(res)=>{
                p.config=JSON.parse(res.replace(/\n/g,''))
                resolve(p)
            })
        })

    })

}

function getUserHome(callback) {
    let cmd='echo %USERPROFILE%'
    if(process.platform=='win32'){
        cmd='echo %USERPROFILE%'
    }else{
        cmd='echo ~%'
    }
    setEnv.getCmd(cmd,(res)=>{
        callback(res)
    })
}

function getJdksys(op){
    return new Promise((reslove,reject)=>{
        setEnv.doCmd('java version','64',(res)=>{
            if(res){
                reslove('64')
            }else{
                reslove('32')
            }
        })
    })

}
function getSys() {
    if(process.platform=='darwin'){
        return "mac"
    }else if(process.platform=='win32'){
        return "window"
    }else{
        return process.platform
    }
}
function ask(p,callback){
    var questions = [{
        type: p.type,
        name: 'res',
        message: p.msg,
        default: function () {
            return p.default;
        },
        validate: function (value) {
            return true
        }

    }]
    inquirer.prompt(questions).then((answers) => {
        callback(answers)
    })
}
function checkJdk(op) {

    return new Promise((resolve,reject)=>{
        op.cstep++
        logger.warning('['+op.cstep+'/'+op.step+']  检查jdk')
        setEnv.doCmd('java','-server',(res)=>{
            // console.log(res)
            if(!res){
                let msg="您还未安装"+op.arch.replace(/x/g,'')+'位'+getSys()+"("+op.config.jdk.version+")"+"版jdk,"+"是否前去下载？"

                ask({type:'confirm',msg:msg },(an)=>{
                    let url=op.config.jdk.url
                    if(an.res){

                        open(url)
                        logger.info('请安装后重新执行weexplus env!')
                    }
                     else {
                        logger.info('放弃配置!')
                    }

                   //  if(op.sys=='win32'){
                   //      if(p.arch=='32'){
                   //          url=op.config.jdk.win['32']
                   //      }else{
                   //          url=op.config.jdk.win['64']
                   //      }
                   //  }
                   //  else if(op.sys=='darwin'){
                   //      url=op.config.jdk.mac
                   //  }
                   // if(an.res){
                   //     download.download({file_url:url})
                   // }
                   // else{
                   //     logger.info('请自行下载jdk，地址如下：')
                   //     logger.fatal(url)
                   // }
                })

            }else{
                logger.info('[✓] jdk已安装，继续下一步')
                getJdksys().then((sys)=>{
                    op.jdksys=sys
                    resolve(op)
                })

            }
        })
    })
}
function checkWeexBuidler(op) {
    op.cstep++
    logger.warning('['+op.cstep+'/'+op.step+']  检查weex-builder是否安装!')
    return new Promise((resolve,reject)=>{
        setEnv.doCmd('weex-builder -V','not',(res)=>{
            if(!res){
                logger.info('[✓] weex-builder已安装，继续下一步')
                resolve(op)
            }else{
                logger.info('[✗] weex-builder未安装，开始安装')
                utils.exec('cnpm install weex-builder -g',false).then(()=>{
                    setEnv.doCmd('weex-builder -V','command not found',(res)=>{
                      if(res){
                          logger.info('安装失败，请百度解决错误后继续执行下面的命令！')
                          logger.info('cnpm install weex-builder -g')
                      }
                      else{
                          logger.info('[✓] weex-builder安装成功，继续下一步')
                          resolve(op)
                      }
                    })
                })
            }

        })
    })

}
function checkCnpm(op) {
    op.cstep++
    logger.warning('['+op.cstep+'/'+op.step+']  检查cnpm是否安装!')
    return new Promise((resolve,reject)=>{
        setEnv.doCmd('cnpm','registry',(res)=>{
            if(res){
                logger.info('[✓] cnpm已安装，继续下一步')
                resolve(op)
            }else{
                logger.info('[✗] cnpm未安装，开始安装')
                utils.exec('npm install -g cnpm --registry=https://registry.npm.taobao.org',false).then(()=>{
                    setEnv.doCmd('cnpm','registry',(res)=>{
                        if(!res){
                            logger.info('安装失败，请百度解决错误后继续执行下面的命令！')
                            logger.info('npm install -g cnpm --registry=https://registry.npm.taobao.org')
                        }
                        else{
                            logger.info('[✓] cnpm安装成功，继续下一步')
                            resolve(op)
                        }
                    })
                })
            }

        })
    })

}
function finish(op){
    return new Promise((resolve,reject)=>{
        logger.info('')
        logger.info('')
        logger.info('')
        logger.info('##############################################')
        logger.info('################ 恭喜环境已配置完成！#########')
        logger.info('##############################################')
        logger.warning('注意环境变量配置完之后要重新开一个控制台才生效')
        logger.warning('如果再本窗口继续执行weexplus env还会得到环境变')
        logger.warning('量未配置的结果！！！！！！！')
        logger.info('##############################################')
        logger.info('')
        logger.info('')
        logger.info('')
        resolve()

    })

}
function checkWeexToolkit(op) {
    op.cstep++
    logger.warning('['+op.cstep+'/'+op.step+']  检查weex-toolkit是否安装!')
    return new Promise((resolve,reject)=>{
        setEnv.doCmd('weex -v','@weex-cli',(res)=>{
            if(res){
                logger.info('[✓] weex-toolkit已安装，继续下一步')
                resolve(op)
            }else{
                logger.info('[✗] weex-toolkit未安装，开始安装')
                utils.exec('cnpm install weex-toolkit -g').then(()=>{
                    setEnv.doCmd('weex -v','@weex-cli',(res)=>{
                        if(!res){
                            logger.info('安装失败，请百度解决错误后继续执行下面的命令！')
                            logger.info('cnpm install weex-toolkit -g')
                        }
                        else{
                            logger.info('[✓] weex-toolkit安装成功，继续下一步')
                            resolve(op)
                        }
                    })
                })
            }

        })
    })

}
function checkPod() {
    return new Promise((resolve,reject)=>{
        op.cstep++
        logger.warning('['+op.cstep+'/'+op.step+']  检查cocopod是否安装!')
        if(op.sys=='darwin'){
            setEnv.doCmd('pod','Usage',(res)=>{
                if(res){
                    logger.info('[✓] cocopod已安装，继续下一步')
                    resolve(op)
                }else{
                    logger.info('[✗] cocopod未安装，开始安装')
                    utils.exec('cnpm install weex-toolkit -g').then(()=>{
                        setEnv.doCmd('weex -v','@weex-cli',(res)=>{
                            if(!res){
                                logger.info('安装失败，请百度解决错误后继续执行下面的命令！')
                                logger.info('cnpm install weex-toolkit -g')
                            }
                            else{
                                logger.info('[✓] weex-toolkit安装成功，继续下一步')
                                resolve(op)
                            }
                        })
                    })
                }

            })
        }

    })
}
function checkXcode(op) {
    return new Promise((resolve,reject)=>{
        op.cstep++
        logger.warning('['+op.cstep+'/'+op.step+']  检查XCode是否安装!')
        if(op.sys=='darwin'){
            let p='/Applications/Xcode.app'
            if(fs.existsSync(p)){
                logger.info('[✓] Xcode 已安装，继续下一步')
                resolve(op)
            }else{
                let msg="您还未安装Xcode,"+"是否前去下载？"

                ask({type:'confirm',msg:msg },(an)=>{
                    let url=op.config.xcode
                    // url='https://download.anydesk.com/anydesk.dmg'
                    if(an.res){
                        open(url,'App Store')
                        logger.info('请安装后重新执行weexplus env!')
                    }
                    else {
                        logger.info('放弃配置!')
                    }
                })
            }
        }

    })
}
function checkAndroidStudio(op) {
    return new Promise((resolve,reject)=>{
        op.cstep++
        logger.warning('['+op.cstep+'/'+op.step+']  检查AndroidStudio是否安装!')

        if(op.sys=='win32'){

        }
        else if(op.sys=='darwin'){
            let p='/Applications/Android Studio.app'
            if(fs.existsSync(p)){
                logger.info('[✓] Android Studio已安装，继续下一步')
                resolve(op)
            }else{
                let msg="您还未安装"+op.arch.replace(/x/g,'')+'位'+getSys()+"版Android Studio,"+"是否前去下载？"

                ask({type:'confirm',msg:msg },(an)=>{
                    let url=op.config.as.mac
                    // url='https://download.anydesk.com/anydesk.dmg'
                    if(an.res){
                        logger.info('如果下载慢，请用一下地址手动下载')
                        logger.info(url)
                        download.download({file_url:url}).then((px)=>{
                            console.log('')
                          open(px)

                        })
                        logger.info('请安装后重新执行weexplus env!')
                    }
                    else {
                        logger.info('放弃配置!')
                    }
                })
            }
        }

    })
}
function checkAndroidHome(op) {
    return new Promise((resolve,reject)=>{
        op.cstep++
        logger.warning('['+op.cstep+'/'+op.step+']  检查ANDROID_HOME环境变量!')
        if(!process.env.ANDROID_HOME){
            logger.info('[✗] ANDROID_HOME环境变量未设置!')
            if(op.sys=='win32'){
                function setAndroidHome(px){
                    if(!fs.existsSync(px+'\\platform-tools'))
                    {
                        ask({type:'input',msg:'目录不正确,请重新输入'},(res)=>{
                            px=res.res
                            setAndroidHome(px)
                        })
                    }
                    else{
                        setEnv.setEnv({name:'ANDROID_HOME',envName:'ANDROID_HOME',weg:'\\platform-tools',validate:(path)=>{
                            return fs.existsSync(path+'\\platform-tools')
                        }})
                    }

                }
                let px=op.userPath+"\\AppData\\Local\\Android\\Sdk"
                if(fs.existsSync(px)){
                    setEnv.setEnv({name:'ANDROID_HOME',envName:'ANDROID_HOME',weg:'\\platform-tools',default:desc,validate:(path)=>{
                            return true
                        }})
                }else{
                    ask({type:'input',msg:'请输入AndroidSdk安装目录'},(res)=>{
                        px=res.res
                        setAndroidHome(px)

                    })
                }
                ///to finish
                // let desc='C:\Program Files\Java\jre8'
                // setEnv.setEnv({name:'JDK',envName:'ANDROID_HOME',weg:'\bin',default:desc,validate:(path)=>{
                //     if(!fs.existsSync(path+'\bin\studio.exe')){
                //         return false
                //     }
                //     return true
                // }})
            }
            else{

                function setAndroidHome(px){
                    if(!fs.existsSync(px+'/platform-tools'))
                    {
                        ask({type:'input',msg:'目录不正确,请重新输入'},(res)=>{
                            px=res.res
                            setAndroidHome(px)

                        })
                    }
                    else{
                        setEnv.writeMacBashProfile(op,{name:'ANDROID_HOME',path:px,weg:['/tools','/platform-tools']})
                        setEnv.doCmd('source ~/.bash_profile','',()=>{
                            resolve(op)
                        })
                    }

                }
                let px=op.userPath+'/Library/Android/sdk'
                if(!fs.existsSync(px+'/platform-tools')){
                  ask({type:'input',msg:'请输入AndroidSdk安装目录'},(res)=>{
                      px=res.res
                      setAndroidHome(px)

                  })
                }
                else{
                    setAndroidHome(px)
                }

            }

        }
        else{
            logger.info('[✓] JAVA_HOME环境变量已设置，继续下一步!')
            resolve(op)
        }

    })
}
function checkJAVAHOME(op){
    return new Promise((resolve,reject)=>{
        op.cstep++
        logger.warning('['+op.cstep+'/'+op.step+']  检查JAVA_HOME环境变量!')
         if(!process.env.JAVA_HOME){
             logger.info('[✗] JAVA_HOME环境变量未设置!')
             if(op.sys=='win32'){
                 getWinJavaPath((s)=>{
                     setEnv.setWinEnv({envName:'JAVA_HOME',path:s,weg:'\\bin'},()=>{
                         logger.info('[✓] JAVA_HOME环境变量已设置，继续下一步!')
                         resolve()
                     })

                 })
             }
             else{
                 MACsetJavaHome.set(op).then(()=>{
                     resolve(op)
                 })
             }

         }
         else{
             logger.info('[✓] JAVA_HOME环境变量已设置，继续下一步!')
             resolve(op)
         }

    })
}
function getWinJavaPath(callback) {
    setEnv.getCmd('java -verbose',(res)=>{
        let p=res.filter((v)=>{
            if(v.indexOf('FieldPosition$')>-1){
                return true
            }
            return false
        })
        let s=p[0]
        p= s.split('from')
        s= p.filter((v)=>{
            if(v.indexOf('rt.jar')>-1){
                return true
            }
            return false
        })[0].replace(']','')
        s=s.split('lib')[0].trim()
        s=s.substr(0,s.length-1)
        s=s.replace('jre','jdk')
        if(fs.existsSync(s)){
            callback(s)
        }
        else{
            logger.info('自动识别jdk路径失败请手动输入！')
            setEnv.setEnvWinAsk({name:'JAVA_HOME',envName:'JAVA_HOME',weg:'\\bin',validate:(v)=>{
                let path=v+'\\bin'
                console.log(path)
               return fs.existsSync(path)
            }})
        }

    })
}
module.exports={checkJdk,getEnv,getSys,getJdksys,checkJAVAHOME,checkWeexBuidler,checkAndroidStudio,checkAndroidHome,checkWeexToolkit,checkCnpm,checkXcode,getWinJavaPath,finish}