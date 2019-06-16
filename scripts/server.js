"use strict";
//加载所需要的模块
const chalk = require('chalk');
const http = require('http');
const querystring = require('querystring');
const url = require('url');
const fs = require('fs');
const path = require('path');
const util = require('./util.js')
const update = require('./update.js')
const log = require('./logger.js')
const logger=require('./logger')
const cp = require('child_process');
const crypto = require('crypto')
// const util = require('./util.js')

//创建服务


const start = (dpath, port, ifopen) => {
    return new Promise((resolve, reject) => {

        const httpServer = http.createServer(function (req, res) {

            processRequest(req, res, dpath)

        });

        const open = require('open');
        var ip = require('ip');

        httpServer.listen(port, ip.address())
        // httpServer.listen(port)
        // open('http://'+ip.address()+":"+port);
        if (ifopen == undefined) {
            ifopen = true;
        }
        var url = 'http://' + ip.address() + ":" + port;
        if (ifopen) {
            try {

                util.open(url)
            }
            catch (ex) {
                console.log(chalk.red("chrome未安装，无法启动浏览器！"));
                console.log(ex)
                open('http://' + ip.address() + ":" + port);
            }
        }
        log.info("静态资源服务器已启动===>[" + chalk.red(dpath) + "]");
        // util.excute('npm run dev')

    });
};

//响应请求的函数
const processRequest = (request, response, dpath) => {
    return new Promise((resolve, reject) => {

        //mime类型
        var mime = {
            "css": "text/css",
            "gif": "image/gif",
            "html": "text/html",
            "ico": "image/x-icon",
            "jpeg": "image/jpeg",
            "jpg": "image/jpeg",
            "js": "text/javascript",
            "json": "application/json",
            "pdf": "application/pdf",
            "png": "image/png",
            "svg": "image/svg+xml",
            "swf": "application/x-shockwave-flash",
            "tiff": "image/tiff",
            "txt": "text/plain",
            "wav": "audio/x-wav",
            "wma": "audio/x-ms-wma",
            "mp3": "audio/mpeg",
            "wmv": "video/x-ms-wmv",
            "xml": "text/xml"
        };


        //request里面切出标识符字符串
        var requestUrl = request.url;

        var arg = url.parse(requestUrl).query;

        //将arg参数字符串反序列化为一个对象
        var params = querystring.parse(arg)
        let md5=params.md5
        // let md5=''



        //url模块的parse方法 接受一个字符串，返回一个url对象,切出来路径
        var pathName = url.parse(requestUrl).pathname;

        //对路径解码，防止中文乱码
        var pathName = decodeURI(pathName);

        //解决301重定向问题，如果pathname没以/结尾，并且没有扩展名
        if (!pathName.endsWith('/') && path.extname(pathName) === '') {
            console.log('301301')
            pathName += '/';
            var redirect = "http://" + request.headers.host + pathName;
            response.writeHead(301, {
                location: redirect
            });
            //response.end方法用来回应完成后关闭本次对话，也可以写入HTTP回应的具体内容。
            response.end();
        }

        //获取资源文件的绝对路径
        // var filePath = path.resolve(__dirname + pathName);
        var filePath = dpath + pathName;

        //console.log(filePath);
        //获取对应文件的文档类型
        //我们通过path.extname来获取文件的后缀名。由于extname返回值包含”.”，所以通过slice方法来剔除掉”.”，
        //对于没有后缀名的文件，我们一律认为是unknown。
        var ext = path.extname(pathName);
        ext = ext ? ext.slice(1) : 'unknown';

        //未知的类型一律用"text/plain"类型
        var contentType = mime[ext] || "text/plain";

        fs.stat(filePath, (err, stats) => {

            if (err) {
                console.log(err)
                response.writeHead(404, {"content-type": "text/html"});
                response.end("<h1>404 Not Found</h1>");
            }

            //没出错 并且文件存在
            if (!err && stats.isFile()) {

                readFile(filePath, contentType);
            }
            //如果路径是目录
            if (!err && stats.isDirectory()) {
                var html = "<head><meta charset = 'utf-8'/></head><body><ul>";
                //读取该路径下文件
                fs.readdir(filePath, (err, files) => {
                    if (err) {
                        console.log("读取路径失败！");
                    } else {
                        //做成一个链接表，方便用户访问
                        var flag = false;
                        for (var file of files) {
                            //如果在目录下找到index.html，直接读取这个文件
                            if (file === "index.html") {
                                readFile(filePath + (filePath[filePath.length - 1] == '/' ? '' : '/') + 'index.html', "text/html");
                                flag = true;
                                break;
                            }
                            ;
                            // console.log(file)
                            // html += `<li><a href='${file}/'>${file}</a></li>`;
                            var info = fs.statSync(filePath + '/' + file)
                            if (info.isFile()) {
                                html += `<li><a href='${file}'>${file}</a></li>`;
                            }
                            else if (info.isDirectory()) {
                                html += `<li><a href='${file}/'>${file}</a></li>`;
                            }


                        }
                        if (!flag) {
                            html += '</ul></body>';
                            response.writeHead(200, {"content-type": "text/html"});
                            response.end(html);

                        }
                    }
                });
            }

            //读取文件的函数
            function readFile(filePath, contentType) {
                // console.log('11111x:'+filePath)
                if(filePath.endsWith(".js")&&filePath.indexOf('dist')!=-1&&filePath.indexOf('file')==-1)
                {
                    // console.log('ssssxxxx')
                    // response.writeHead(200, {"content-type": "text/javascript;charset=UTF-8'"});
                    response.writeHead(200, {"content-type": "text/html"});
                    let res= readJs(filePath,md5)
                    // console.log(res)
                    response.end(res);
                    return;
                }
                // console.log('22222')
                response.writeHead(200, {"content-type": contentType + ';charset=utf-8'});
                //建立流对象，读文件
                var stream = fs.createReadStream(filePath);
                //错误处理
                stream.on('error', function () {
                    response.writeHead(500, {"content-type": contentType + ';charset=utf-8'});
                    response.end("<h1>500 Server Error</h1>");
                });
                //读取文件
                stream.pipe(response);
            }
        });
    })
}

function md5(s){
    const md5 = crypto.createHash('md5');

// 往hash对象中添加摘要内容
    md5.update(s);
    let res= md5.digest('hex')
    // console.log('md5本地'res)
    return res

}
function readJs(path,md5s)
{
    // console.log('xxxx')
    const content=  fs.readFileSync(path, 'utf8')
    // console.log(content)

    const appboard=readAppboard();
    // console.log('md5-app='+md5s)
    // console.log('md5-cli='+md5(appboard))
    var s=  appboard+content;
    if(md5s!=md5(appboard)&&md5s!=undefined){
        // console.log('md5-app='+md5s)
        // console.log('md5-cli='+md5(appboard))
        // console.log('md5不同，重新appboard')
        // s=  appboard+'weexplus_split_weexplus'+content;
        s=  appboard+'/*******weexplus_split_weexplus******/'+content;
        // s=  appboard+content;
        return s
    }
    return content
}


// function readJs(path,md5s)
// {
//
//     const content=  fs.readFileSync(path, 'utf8')
//     const appboard=readAppboard();
//     var s=  appboard+content;
//     // console.log(s)
//     return s;
// }

function readAppboard() {
    if (!update.isRootDir()) {
        console.log(chalk.red('必须在根项目根目录操作！'));
        return "";
    }
    var p = util.config().appBoard
    if(p==undefined)
    {
        logger.fatal('weexplus.json中未设置appBoard的值!')
        return "";
    }


    var ip = require('ip');
    // p= path.join(process.cwd(),p.replace('root:','/src'))
    p = process.cwd() + '/' + p.replace('root:', 'dist/')
    // logger.log(p)
    if(!fs.existsSync(p))
    {
        return "";
    }
    const appBoardContent = fs.readFileSync(p, 'utf8')
    // console.log(appBoardContent)
    return appBoardContent;
}


module.exports = {
    start, readAppboard

};
