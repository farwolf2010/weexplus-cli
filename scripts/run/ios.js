const path = require('path');
const chalk = require('chalk');
const childprocess = require('child_process');
const inquirer = require('inquirer');
const copy = require('recursive-copy');
const fs = require('fs');
const utils = require('../utils');
const server = require('./server');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const home = require('user-home')
const exit = require('exit');
const _ = require('underscore');
const logger = utils.logger;
const {
  PlatformConfig,
  iOSConfigResolver,
  Platforms
} = require('../utils/config');

/**
 * compile jsbundle.
 */
const copyJsbundleAssets = (dir, src, dist, quiet) => {
  const options = {
    filter: [
      '**/*.js',
      '!**/*.web.js'
    ],
    overwrite: true
  };
  if (!quiet) {
    logger.info(`Move JSbundle to dist`);
    return copy(path.join(dir, 'dist'), path.join(dir, 'platforms/ios/bundlejs/'), options)
    .on(copy.events.COPY_FILE_START, function (copyOperation) {
      logger.verbose('Copying file ' + copyOperation.src + '...');
    })
    .on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
      logger.verbose('Copied to ' + copyOperation.dest);
    })
    .on(copy.events.ERROR, function (error, copyOperation) {
      logger.error('Error:' + error.stack);
      logger.error('Unable to copy ' + copyOperation.dest);
    })
    .then(result => {
      logger.verbose(`Move ${result.length} files.`);
    });
  }
  return copy(path.join(dir, 'dist'), path.join(dir, 'platforms/ios/bundlejs/'), options);
};

/**
 * pass options.
 * @param {Object} options
 */
const passOptions = (options) => {
  logger.verbose(`passOptions ${options}.`);
  return new Promise((resolve, reject) => {
    resolve({
      options
    });
  });
};

/**
 * Prepare
 * @param {Object} options
 */
const prepareIOS = ({ options }) => {
  logger.verbose(`prepareIOS  with ${options}.`);
  return new Promise((resolve, reject) => {
    const rootPath = process.cwd();
    // console.log('rootPath='+rootPath)
    if (!utils.checkIOS(rootPath)) {
      logger.error('iOS project not found !');
      logger.info(`You should run ${chalk.blue('weex create')} or ${chalk.blue('weex platform add ios')} first`);
      reject();
    }
    // change working directory to ios
    process.chdir(path.join(rootPath, 'platforms/ios/'+options.dir))
    const xcodeProject = utils.findXcodeProject(process.cwd());

    if (xcodeProject) {
      logger.info(`start iOS app`);
      resolve({ xcodeProject, options, rootPath });
    }
    else {
      logger.info(`Could not find Xcode project files in ios folder.`);
      logger.info(`Please make sure you have installed iOS Develop Environment and CocoaPods`);
      reject();
    }
  });
};

/**
 * @desc start websocker server for hotreload
 * @param {Object} xcodeProject
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
const startHotReloadServer = (
{
  xcodeProject,
  options,
  rootPath
}
) => {

  return server.startWsServer(rootPath).then(({ host, ip, port }) => {
    const configs = _.extend({}, { Ws: host, ip, port });
    return {
      xcodeProject,
      options,
      rootPath,
      configs
    };
  });
};

/**
 * @desc when the source file changed, tell native to reload the page.
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
const registeFileWatcher = (
{
  xcodeProject,
  options,
  rootPath,
  configs
}
) => {
  const ws = new WebSocket(configs.Ws);
  // build js on watch mode.
  utils.buildJS('dev', true);

  // file watch task
  chokidar.watch(path.join(rootPath, 'dist'), { ignored: /\w*\.web\.js$/ })
  .on('change', (event) => {
    copyJsbundleAssets(rootPath, 'dist', 'platforms/ios/bundlejs/', true).then(() => {
      if (path.basename(event) === configs.WeexBundle) {
        logger.log(`Wait Reload...`);
        ws.send(JSON.stringify({ method: 'WXReloadBundle', params: `http://${configs.ip}:${configs.port}/${configs.WeexBundle}` }));
      }
    });
  });
  return {
    xcodeProject,
    options,
    rootPath,
    configs
  };
};

/**
 * @desc resolve config in the android project
 * @param {Object} options
 * @param {String} rootPath
 */
const resolveConfig = ({
                         xcodeProject,
                         options,
                         rootPath,
                         configs
                       }) => {
  const iosConfig = new PlatformConfig(iOSConfigResolver, rootPath, Platforms.ios, configs);
  return iosConfig.getConfig().then((configs) => {
    iOSConfigResolver.resolve(configs);
    return {
      xcodeProject,
      options,
      rootPath,
      configs
    };
  });
};

/**
 * Install dependency
 * @param {Object} xcode project
 * @param {Object} options
 */
const installDep = ({ xcodeProject, options, rootPath, configs }) => {
  logger.info(`pod install`);
  return utils.exec('pod install').then(() => ({ xcodeProject, options, rootPath, configs }));
};

/**
 * find ios devices
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Array} devices lists
 */
const findIOSDevice = ({ xcodeProject, options, rootPath, configs }) => {
  return new Promise((resolve, reject) => {
    let deviceInfo = '';
    try {
      deviceInfo = childprocess.execSync('xcrun instruments -s devices', { encoding: 'utf8' });
    }
    catch (e) {
      reject(e);
    }
    const devicesList = utils.parseIOSDevicesList(deviceInfo);
    resolve({ devicesList, xcodeProject, options, rootPath, configs });
  });
};

/**
 * Choose one device to run
 * @param {Array} devicesList: name, version, id, isSimulator
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Object} device
 */
const chooseDevice = ({ devicesList, xcodeProject, options, rootPath, configs }) => {
  return new Promise((resolve, reject) => {
    if (devicesList && devicesList.length > 0) {
      const listNames = [new inquirer.Separator(' = devices = ')];
      for (const device of devicesList) {
        listNames.push(
        {
          name: `${device.name} ios: ${device.version} ${device.isSimulator ? '(Simulator)' : ''}`,
          value: device
        }
        );
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
        const device = answers.chooseDevice;
        resolve({ device, xcodeProject, options, rootPath, configs });
      });
    }
    else {
      reject('No ios devices found.');
    }
  });
};

/**
 * build the iOS app on simulator or real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const buildApp = ({ device, xcodeProject, options, rootPath, configs,resolve, reject }) => {
  let projectInfo = '';
  try {
    projectInfo = utils.getIOSProjectInfo();
  }
  catch (e) {
    reject(e);
  }
  // console.log('resolve='+resolve)

  const scheme = projectInfo.project.schemes[0];
  if (device.isSimulator) {
   return _buildOnSimulator({ scheme, device, xcodeProject, options, resolve, reject, rootPath, configs });
  }
  else {
    return _buildOnRealDevice({ scheme, device, xcodeProject, options,  rootPath, configs,resolve, reject});
  }
};

/**
 * build the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const _buildOnSimulator = ({ scheme, device, rootPath, xcodeProject, options, configs, resolve, reject }) => {
  logger.info(`buildOnSimulator Buiding project...`);
  // logger.info('xxx--0=')
  try {
    // logger.info('xxx0=')
    // if (_.isEmpty(configs)) {
    //   reject(new Error('iOS config dir not detected.'));
    // }
    // logger.info('xxx1=')
    let cmd='xcodebuild -workspace '+scheme+'.xcworkspace -scheme '+scheme+' -configuration Debug -destination id='+device.udid+' -sdk iphonesimulator -derivedDataPath build '
    // logger.info('xxx2='+cmd)
    return utils.exec(cmd);
  }
  catch (e) {
    logger.info('ex'+e)
    reject(e);
  }
  resolve({ device, xcodeProject, options, configs });
};

/**
 * build the iOS app on real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const _buildOnRealDevice = ({ scheme, device, xcodeProject, options,  rootPath, configs,resolve  }) => {

  logger.info(`Buiding project...`);
  let cmd='xcodebuild -workspace '+scheme+'.xcworkspace -scheme '+scheme+' -configuration Debug -sdk iphoneos'
  return utils.exec(cmd)


};

/**
 * Run the iOS app on simulator or device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const runApp = ({ device, xcodeProject, options, configs }) => {
  return new Promise((resolve, reject) => {
    logger.info('runApp')
    if (device.isSimulator) {
      _runAppOnSimulator({ device, xcodeProject, options, configs, resolve, reject });
    }
    else {
      // reject(`weex don't support run on real device, please use simulator on Xcode.`)
      _runAppOnDevice({ device, xcodeProject, options, configs, resolve, reject });
    }
  });
};

/**
 * Run the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const _runAppOnSimulator = ({ device, xcodeProject, options, configs, resolve, reject }) => {
  const inferredSchemeName = path.basename(xcodeProject.name, path.extname(xcodeProject.name));
  let appPath;
  if (options.iosBuildPath && fs.existsSync(options.iosBuildPath)) {
    appPath = options.iosBuildPath;
  }
  else if (fs.existsSync(path.join(home, `Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphonesimulator/${inferredSchemeName}.app`))) {
    appPath = path.join(home, `Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphonesimulator/${inferredSchemeName}.app`);
  }
  else if(fs.existsSync(`build/Build/Products/Debug-iphonesimulator/${inferredSchemeName}.app`)) {
    appPath = `build/Build/Products/Debug-iphonesimulator/${inferredSchemeName}.app`
  }
  else {
    reject(`You may had custome your XCode Deviced Data path, please use \`--iosBuildPath\` to set your path.`);
    return;
  }
  logger.info(`Run iOS Simulator..`);
  try {
    childprocess.execFileSync(
    '/usr/libexec/PlistBuddy',
    ['-c', 'Print:CFBundleIdentifier', path.join(appPath, 'Info.plist')],
    { encoding: 'utf8' }
    ).trim();
  } catch (e) {
    reject(e);
    return;
  }
  let simctlInfo = '';
  try {
    simctlInfo = childprocess.execSync('xcrun simctl list --json devices', { encoding: 'utf8' });
  }
  catch (e) {
    reject(e);
    return;
  }
  simctlInfo = JSON.parse(simctlInfo);

  if (!simulatorIsAvailable(simctlInfo, device)) {
    reject('simulator is not available!');
    return;
  }

  logger.info(`Launching ${device.name}...`);

  try {
    childprocess.execSync(`xcrun instruments -w ${device.udid}`, { encoding: 'utf8', stdio: 'ignore' });
  }
  catch (e) {
    // instruments always fail with 255 because it expects more arguments,
    // but we want it to only launch the simulator
  }

  logger.info(`Installing ${appPath}`);

  try {
    childprocess.execSync(`xcrun simctl install booted ${appPath}`, { encoding: 'utf8' });
  }
  catch (e) {
    reject(e);
    return;
  }


  let p=process.cwd()
  p+='/'+options.dir+'.xcodeproj/project.pbxproj'
  // console.log('xxss='+p)
  let appId=utils.appId(p)
  // console.log('xxss='+appId)
  try {
    childprocess.execSync(`xcrun simctl launch booted ${appId}`, { encoding: 'utf8' });
  }
  catch (e) {
    reject(e);
    return;
  }
  logger.success('Success!');
  resolve();
};

/**
 * Run the iOS app on device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const _runAppOnDevice = ({ device, xcodeProject, options, resolve, reject }) => {
  // @TODO support run on real device
  let inferredSchemeName=options.dir
  let y=path.join(home, `Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphoneos/${inferredSchemeName}.app`)
  console.log('sssss='+y)
  const deviceId = device.udid;
  let appPath;
  if (options.iosBuildPath && fs.existsSync(options.iosBuildPath)) {
    appPath = options.iosBuildPath;
  }
  else if (fs.existsSync(path.join(home, `Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphoneos/${inferredSchemeName}.app`))) {
    appPath = path.join(home, `Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphoneos/${inferredSchemeName}.app`);
  }
  else if(fs.existsSync(`build/Build/Products/Debug-iphoneos/${inferredSchemeName}.app`)) {
    appPath = `build/Build/Products/Debug-iphoneos/${inferredSchemeName}.app`
  }
  else {
    reject(`You may had custome your XCode Deviced Data path, please use \`--iosBuildPath\` to set your path.`);
    return;
  }
  logger.info(`Run iOS Device..`);
  try {
    var px=__dirname.split('weexplus')[0]+'weexplus/node_modules/.bin/ios-deploy'

    logger.info(childprocess.execSync(px+` --justlaunch --debug --id ${deviceId} --bundle ${path.resolve(appPath)}`, { encoding: 'utf8' }));
    logger.info('Success!');
  }
  catch (e) {
    reject(e);
  }
};

/**
 * check simulator is available
 * @param {JSON} info simulator list
 * @param {Object} device user choose one
 * @return {boolean} simulator is available
 */
const simulatorIsAvailable = (info, device) => {
  info = info.devices;
  let simList;
  // simList = info['iOS ' + device.version]
  for (const key in info) {
    if (key.indexOf('iOS') > -1) {
      simList = info[key];
      for (const sim of simList) {
        if (sim.udid === device.udid) {
          return sim.availability === '(available)';
        }
      }
    }
  }
};

/**
 * Run iOS app
 * @param {Object} options
 */
const runIOS = (options) => {
  // logger.info(options.dir)
  // return
  logger.info(`npm run build`);
  utils.exec('weexplus copy').then(()=>{
    return {options}
  })
  .then(prepareIOS)
  .then(installDep)
  .then(findIOSDevice)
  .then(chooseDevice)
  .then((p)=>{
      buildApp(p).then(()=>{
        logger.info('start run')
        runApp(p)
      },(exp)=>{
        console.log(exp)
      })
  })

};


function publish(options)
{
  let dir=options.dir
  let root=process.cwd()+'/platforms/ios/'+dir+'/'
  // console.log(root)
  let outputPath=root+'products/'
  utils.exec('rm -rf dist/*').then(()=>{
    return utils.exec('weex-builder src/native dist --ext --min')
  })
  .then(()=>{
    return utils.exec('weexplus copy')
  })
  .then(()=>{
    return {options}
  })
  .then(prepareIOS)
  .then(installDep)
  .then((p)=>{
    // let cmd=  'xcodebuild -workspace  '+p.scheme+'.xcworkspace -scheme '+p.scheme+' -configuration Release -sdk iphoneos build archive -archivePath  '+root+'/archive'
    // let cmd='xcodebuild -workspace '+scheme+'.xcworkspace -scheme '+scheme+' -configuration Debug -sdk iphoneos clean build'
    let cmd='xcodebuild -workspace '+root+dir+'.xcworkspace -scheme '+dir+' -configuration Release -sdk iphoneos build archive -archivePath '+outputPath+'/archive'
    // console.log('xx='+cmd)
    return utils.exec(cmd)
  })
  .then(()=>{
       let cmd='xcodebuild -exportArchive —exportFormat ipa -archivePath '+outputPath+'/archive.xcarchive -exportPath  '+outputPath+dir+'.ipa -exportOptionsPlist  '+root+'ExportOption.plist'
    // console.log('xx='+cmd)
    return utils.exec(cmd)
  })
  .then(()=>{
    var path=  process.cwd();
    // console.log(path)
    var open=require('open')
    open(outputPath+dir+'.ipa')
  })

}
// function publish(options)
// {
//   utils.checkAndInstallForIosDeploy()
//   .then(utils.buildJS('build',options.dir))
//   .then(()=>{
//     return utils.exec('rsync  -r -q  dist/* platforms/ios/'+options.dir+'/app/')
//   })
//   .then(()=> {
//     startJSServer()
//     return {options}
//   }).then(prepareIOS)
//   .then(installDep)
//   .then(buildApp)
//   .then(()=>{
//
//     var path=  process.cwd();
//     console.log(path)
//     var open=require('open')
//     open(path)
//   })
// }

module.exports = {runIOS,_buildOnRealDevice,publish}
