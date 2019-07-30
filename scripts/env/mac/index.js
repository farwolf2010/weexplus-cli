let common=require('../common')
let logger=require('../../logger')
let setJavaHome=require('./setJavaHome')
let setCocopod=require('./setCocopod')
function check(op) {
    // console.log(op)
    if(op.platform=='all'){
        common.checkCnpm(op)
            .then(common.checkWeexToolkit)
            .then(common.checkWeexBuidler)
            .then(common.checkJdk)
            .then(common.checkJAVAHOME)
            .then(common.checkAndroidStudio)
            .then(common.checkAndroidHome)
            .then(common.checkXcode)
            .then(setCocopod.check)
            .then(common.finish)
    }else if(op.platform=='ios'){
         common.checkXcode(op)
            .then(setCocopod.check)
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