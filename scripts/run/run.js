#!/usr/bin/env node



const run = (platform,options) => {
  return new Promise((resolve, reject) => {
    // const chalk = require('chalk');
    // // console.log(chalk.green("发送更新指令"));  
       ////////////
   const chalk = require('chalk')
   const runAndroid = require('./android')
   const runIOS = require('./ios.js')
   if(!isValidPlatform(platform))
   {
          reject();
          return;
   }
   if(platform=='android')
   {
       runAndroid.runAndroid(options); 
   }
   else if(platform=='ios')
   {
        runIOS.runIOS(options); 
   }
   
       ////////////
            
  });
};




function isValidPlatform(platform) {
  if (platform) {
    return platform === 'android' || platform=== 'ios' || platform=== 'web'
  }
  return false
}

module.exports = {
  run
  
}; 

