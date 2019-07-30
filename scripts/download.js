
const progress = require('./progress')
var inquirer = require('inquirer')
var request = require('request')
var fs = require('fs')


function download({file_url}){
    return new Promise((resolve,reject)=>{
        var pb = new progress('下载进度', 50);
        // var file_url = 'https://nodejs.org/dist/v8.9.4/node-v8.9.4-win-x64.zip';
        let name=file_url.split("/").reverse()[0]
        var out = fs.createWriteStream(name);
        let total=0
        let download=0
        var req = request({
            method: 'GET',
            uri: file_url
        });

        req.pipe(out);

        req.on('data', function (chunk) {
            download+=chunk.length
            pb.render({ completed: download, total: total });
            // console.log('data:'+chunk.length);
        });

        req.on('end', function() {
            //Do something
            resolve(name)
        });
        req.on('error', function() {
            //Do something
            reject()
        });

        req.on( 'response', function ( data ) {
            total=data.headers[ 'content-length' ]
            // console.log('response:'+ data.headers[ 'content-length' ] );

        } );
    })

}


module.exports={download}



