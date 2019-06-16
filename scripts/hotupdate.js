const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')
const fs = require('fs')
const inquirer = require('inquirer')
const ncopy = require('recursive-copy');

const utils = require('./utils')
const file = require('./file')
const log = require('./logger')
const copy = require('copy-concurrently')
function make () {
    file.del('app')
    file.mkdir('app')
    log.info('开始编译..')
    utils.exec('weex-builder src/native app --ext --min').then(()=>{
        log.info('开始复制文件..')
        ncopy('./src/native/img','./app/img',{},()=>{
            ncopy('./src/native/font','./app/font',{},()=>{
                ncopy('./src/native/file','./app/file',{},()=>{
                    ncopy('./configs/weexplus.json','./app/weexplus.json',{},()=>{
                        zip()
                    })
                })
            })
        })



    })
}

function zip() {
    file.del('app.zip')
    // return
    var fs = require('fs');
    var archiver = require('archiver');
    var output = fs.createWriteStream('app.zip');
    var archive = archiver('zip');
    archive.on('error', function(err){
        throw err;
    });
    output.on('close', function() {
        file.del('./app')
        log.info('压缩完成，请取包，地址如下：')
        log.info(process.cwd()+'/app.zip')

    });

    archive.pipe(output);
    archive.bulk([
        { src: ['app/**']}
    ]);
    archive.finalize();

}

module.exports={zip,make}