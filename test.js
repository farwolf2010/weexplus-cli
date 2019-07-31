// const ios=require('./scripts/run/ios')
const setEnv = require('./scripts/env/setEnv')
const utils = require('./scripts/utils')
const envCommon = require('./scripts/env/common')
const win = require('./scripts/env/win')
const logger = require('./scripts/logger')
const setJavaHome = require('./scripts/env/mac/setJavaHome')
const setCocopod = require('./scripts/env/mac/setCocopod')
const child_process = require('child_process')
const fs = require('fs')
const open = require('open')

envCommon.checkJAVAHOME({sys:'win32'})
// utils.exec('setx JAVA_HOME DSDSDS')

// let cmd='reg query "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment"'
// let cmd='ECHO %PATH%'
// setEnv.getCmd(cmd,(res)=>{
//  // console.log(res[0])
//     let px=res[0]
//     // console.log(px.length)
//     let sp=px.split(';')
//     // console.log(sp)
//     let ary=[]
//     let temp=' '
//     sp.forEach((item)=>{
//         // console.log(item+temp.indexOf(item))
//      if(temp.indexOf(item)==-1){
//          ary.push(item)
//          temp+=item+';'
//      }
//     })
//     let s=''
//     ary.forEach((item)=>{
//      s+=item+';'
//     })
//     // console.log(s)
//     // console.log(s.length)
//     utils.exec('setx PATH \"'+s+';D:/;'+'\"')
// })


