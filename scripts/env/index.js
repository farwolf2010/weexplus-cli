let common=require('./common')
let win=require('./win')
let mac=require('./mac')
const logger = require('../../scripts/logger')
function check(op){
    common.getEnv().then((res)=>{

        res.platform=op.platform
        logger.info("欢迎使用weexplus环境自动配置！")
        logger.info("当前您使用的是"+res.arch.replace(/x/g,'')+'位'+common.getSys()+'系统！')
        if(res.sys=='win32'){
            // win.check(res)
            this.log('windows系统,敬请期待!')
        }else if(res.sys=='darwin'){
            if(op.platform=='android'){
                res.step=4
            }else if(op.platform=='ios'){
                res.step=5
            }else{
                res.step=12
            }
            mac.check(res)
        }else{
            this.log('其它系统,敬请期待!')
        }

    })
}
module.exports={check}