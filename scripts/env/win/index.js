let common=require('../common')
let logger=require('../../logger')
function check(op) {
    if(op.platform=='all'){
        common.checkCnpm(op)
            .then(common.checkWeexToolkit)
            .then(common.checkWeexBuidler)
            .then(common.checkJdk)
            .then(common.checkJAVAHOME)
            .then(common.checkAndroidStudio)
            .then(common.checkAndroidHome)
            .then(common.finish)
    }else if(op.platform=='android'){
        common.checkJdk(op)
            .then(common.checkJAVAHOME)
            .then(common.checkAndroidStudio)
            .then(common.checkAndroidHome)
            .then(common.finish)
    }
}

module.exports={check}