const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')
const fs = require('fs')
const inquirer = require('inquirer')
const copy = require('recursive-copy')
const utils = require('../utils')
const util = require('../util')
const startJSServer = require('./server')
const {Config,androidConfigResolver} = require('../utils/config')
/**
 * Build and run Android app on a connected emulator or device
 * @param {Object} options
 */
function runAndroid(options) {
  console.log(` => ${chalk.green.bold('weexplus run android')}`)
  let dir=options.dir
  let rootpath=process.cwd();
  let p=util.readProperties(rootpath+'/platforms/android/'+dir+'/gradle.properties')
  let appId=p.appId
  utils.exec('weexplus copy')
  .then(()=>{
    return findAndroidDevice(options)
  })
  .then((res)=>{
    return chooseDevice(res.devicesList,options)
  })
  .then((res)=>{
    // console.log(res)
    return reverseDevice(res.device,options)
  })
  .then(()=>{
    process.chdir('platforms/android/'+dir)
    var path=  process.cwd();
      // console.log(path)
    let cmd='./gradlew assembleDebug'
    if (process.platform != 'darwin'&&process.platform != 'linux'){
      cmd='gradlew.bat assembleDebug'
    }
    return utils.exec(cmd)
  })
  .then(()=>{
    var px=  process.cwd();
    var open=require('open')
    process.chdir(path.join(px,'app/build/outputs/apk/debug'))
    return utils.exec('adb install -r app-debug.apk')
  })
  .then(()=>{
    return utils.exec('adb shell am start -n  '+appId+'/com.farwolf.weex.activity.SplashActivity_')
  })




}

function publish(options)
{
  utils.exec('weex-builder src/native dist --ext --min').then(()=>{
    return utils.exec('weexplus copy')
  })
  .then(()=>{
    process.chdir('platforms/android/'+dir)
    // return utils.exec('gradle assembleRelease')
    let cmd='./gradlew assembleRelease'
    if (process.platform != 'darwin'&&process.platform != 'linux'){
      cmd='gradlew.bat assembleRelease'
    }
    return utils.exec(cmd)
  })
  .then(()=>{
    var path=  process.cwd();
    console.log(path)
    var open=require('open')
    open(path+'/app/build/outputs/apk/release')
  })

}

/**
 * Prepare
 * @param {Object} options
 */
function prepareAndroid({options}) {
  return new Promise((resolve, reject) => {
    const rootPath = process.cwd()

    if (!utils.checkAndroid(rootPath,options.dir)) {
      console.log(rootPath)
      console.log(chalk.red('  Android project not found !'))
      console.log()
      console.log(`  You should run ${chalk.blue('weexpack create')} or ${chalk.blue('weexpack platform add android')}  first`)
      reject()
    }

    console.log()
    console.log(` => ${chalk.blue.bold('Will start Android app')}`)

    // change working directory to android
    process.chdir(path.join(rootPath, 'platforms/android/'+options.dir))
     // console.log(process.env)
    // if (!process.env.ANDROID_HOME) {
    //   console.log()
    //   console.log(chalk.red('  Environment variable $ANDROID_HOME not found !'))
    //   console.log()
    //   console.log(`  You should set $ANDROID_HOME first.`)
    //   console.log(`  See ${chalk.cyan('http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x')}`)
    //   reject()
    // }

    // try {
    //   child_process.execSync(`adb kill-server`, {encoding: 'utf8'})
    // } catch (e) {
    //   reject()
    // }
    // try {
    //   child_process.execSync(`adb start-server`, {encoding: 'utf8'})
    // } catch (e) {
    //   reject()
    // }

  try {
    child_process.execSync(`adb start-server`, {encoding: 'utf8'})
  } catch (e) {
    reject()
  }
  try {
    child_process.execSync(`adb devices`, {encoding: 'utf8'})
  } catch (e) {
    reject()
  }
    resolve({options, rootPath})
  })
}
function resolveConfig({options,rootPath}) {
  let androidConfig = new Config(androidConfigResolver, path.join(rootPath, 'android.config.json'));
  return androidConfig.getConfig().then((config) => {
    androidConfigResolver.resolve(config);
    return {options, rootPath};
  })
}
/**
 * find android devices
 * @param {Object} options
 */
function findAndroidDevice({options}) {
  return new Promise((resolve, reject) => {
    let devicesInfo = ''
    try {
      devicesInfo = child_process.execSync(`adb devices`, {encoding: 'utf8'})
    } catch (e) {
      console.log(chalk.red(`adb devices failed, please make sure you have adb in your PATH.`))
      console.log(`See ${chalk.cyan('http://stackoverflow.com/questions/27301960/errorunable-to-locate-adb-within-sdk-in-android-studio')}`)
      reject()
    }

    let devicesList = utils.parseDevicesResult(devicesInfo)
    resolve({devicesList, options})
  })
}

/**
 * Choose one device to run
 * @param {Array} devicesList: name, version, id, isSimulator
 * @param {Object} options
 */
function chooseDevice(devicesList,options) {
  return new Promise((resolve, reject) => {
    if (devicesList && devicesList.length > 1) {
      const listNames = [new inquirer.Separator(' = devices = ')]
      for (const device of devicesList) {
        listNames.push(
          {
            name: `${device}`,
            value: device
          }
        )
      }

      inquirer.prompt([
          {
            type: 'list',
            message: 'Choose one of the following devices',
            name: 'chooseDevice',
            choices: listNames
          }
        ])
        .then((answers) => {
          const device = answers.chooseDevice
          resolve({device, options})
        })
    } else if (devicesList.length == 1) {
      resolve({device: devicesList[0], options})
    }
    else {
      reject('No android devices found.')
    }
  })
}

/**
 * Adb reverse device, allow device connect host network
 * @param {String} device
 * @param {Object} options
 */
function reverseDevice(device, options) {
  return new Promise((resolve, reject) => {
    try {
      let s = child_process.execSync(`adb -s ${device} reverse tcp:8080 tcp:8080`, {encoding: 'utf8'})
    } catch (e) {
      console.error('reverse error[ignored]');
      resolve({device, options})
    }

    resolve({device, options})
  })
}

/**
 * Build the Android app
 * @param {String} device
 * @param {Object} options
 */
function buildApp({device, options}) {
  return new Promise((resolve, reject) => {
    console.log(` => ${chalk.blue.bold('Building app ...')}`)
 const rootPath = process.cwd()
    console.log('build='+rootPath)
    let clean = options.clean ? ' clean' : '';
    try {
      child_process.execSync(process.platform === 'win32' ? `call gradlew.bat${clean} assemble` : `./gradlew${clean} assemble`, {
        encoding: 'utf8',
        stdio: [0, 1, 2]
      })
    } catch (e) {
      reject()
    }

    resolve({device, options})
  })
}

/**
 * Install the Android app
 * @param {String} device
 * @param {Object} options
 */
function installApp({device, options}) {
  return new Promise((resolve, reject) => {
    console.log(` => ${chalk.blue.bold('Install app ...')}`)
    const rootPath = process.cwd()
    // console.log(rootPath)
    const apkName =rootPath+'/app/build/outputs/apk/app-debug.apk'
    console.log(chalk.green('=============================================='));
    console.log(chalk.green('=============================================='));
    console.log(chalk.green("apk输出目录："+rootPath+'/app/build/outputs/apk'));
    console.log(chalk.green('=============================================='));
    console.log(chalk.green('=============================================='));

    try {
      child_process.execSync(`adb -s ${device} install -r  ${apkName}`, {encoding: 'utf8'})
    } catch (e) {
      reject()
    }

    resolve({device, options})
  })
}

/**
 * Run the Android app on emulator or device
 * @param {String} device
 * @param {Object} options
 */
function runApp({device, options}) {
  return new Promise((resolve, reject) => {
    console.log(` => ${chalk.blue.bold('Running app ...')}`)
    const rootPath = process.cwd()
    console.log(rootPath)
    const packageName = fs.readFileSync(
      'app/src/main/AndroidManifest.xml',
      'utf8'
    ).match(/package="(.+?)"/)[1]


    try {
      child_process.execSync(`adb -s ${device} shell am start -n ${packageName}/com.farwolf.weex.activity.SplashActivity_`, {encoding: 'utf8'})
    } catch (e) {
      reject(e)
    }

    resolve()
  })
}

module.exports = {runAndroid,publish,findAndroidDevice}