var gm = require("gm");
var fs=require('fs');

function resize(src, dest, resizeWidth,resizeHeight,quality) {
    return new Promise(function(resolve, reject) {
        // 900_600_90 => 宽度900/高度600/品质90

        // 解析裁切的目标宽高
        // let resizeWidth = parseInt(rules[0]);
        // let resizeHeight = parseInt(rules[1]);
        // let quality = parseInt(rules[2]) || defaultQuality;
        const readStream = fs.createReadStream(src);
        const writeStream = fs.createWriteStream(dest);
        gm(readStream)
            .size({
                bufferStream: true
            }, function(err, size) {
                if (err) {
                    return reject(err);
                }
                const origWidth = size.width;
                const origHeight = size.height;
                let resizeResult;
                // 缩放的宽度和高度做最大最小值限制
                if (resizeWidth) {
                    if (resizeWidth > origWidth * 1.5) {
                        resizeWidth = Math.floor(origWidth * 1.5);
                    }
                    // else if (resizeWidth < minSize) {
                    //     resizeWidth = minSize;
                    // }
                }
                if (resizeHeight) {
                    if (resizeHeight > origHeight * 1.5) {
                        resizeHeight = Math.floor(origHeight * 1.5);
                    }
                    // else if (resizeHeight < minSize) {
                    //     resizeHeight = minSize;
                    // }
                }
                resizeResult = this.resize(resizeWidth, resizeHeight);
                resizeResult
                    .quality(quality)
                    .interlace('line') // 使用逐行扫描方式
                    .unsharp(2, 0.5, 0.5, 0)
                    .stream()
                    .on('end', resolve)
                    .pipe(writeStream);
            });
    });
};


let from='/Users/zhengjiangrong/Desktop/1024.png'
let to='/Users/zhengjiangrong/Desktop/tp/'


let ary=[{size:20},{size:29},{size:40},{size:40,name:'40-1.png'},{size:58},{size:76},{size:80},{size:152},{size:167},{size:1024}]
ary.forEach((item)=>{
    let path=to
    if(item.name){
        path+=item.name
    }else{
        path+=item.size+'.png'
    }
    resize(from,path,item.size,item.size,100)
})
