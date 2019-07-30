const setEnv = require('../setEnv')
const common = require('../common')
const logger = require('../../logger')
var inquirer = require('inquirer')

function set(op){
    return new Promise((reslove,reject)=>{
        setEnv.getCmd('which java',(ary)=>{
            let px=ary[0]
            setEnv.getCmd('ls -l '+px,(ary1)=>{
                let cm= ary1[0].replace(/\/java/g,'').split('->')[1]+'/java_home'
                setEnv.getCmd(cm,(ary2)=>{
                    let home=ary2[0]
                    setEnv.writeMacBashProfile(op,{name:'JAVA_HOME',path:home,weg:'/bin'})
                    setEnv.doCmd('source ~/.bash_profile','',()=>{
                        reslove(op)
                    })
                })
            })
        })
    })

}
module.exports={set}