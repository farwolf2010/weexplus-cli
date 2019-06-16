var fs=require('fs');
const log=require('../logger')
const util=require('../util')
const net=require('../utils/net')
const inquirer = require('inquirer')
let base=net.base

function excute(op){
   let path=process.cwd()
    if(!fs.existsSync(path+'/plugins/'+op.name+'/plugin.json')){
        log.fatal('没有检测到'+op.name+'插件，请确认插件是否存在或名称是否输入错误！')
        return
    }
    var questions = [{
        type: 'input',
        name: 'desc',
        default: function () {
            return 'this is a weexplus plugin project';
        },
        message: "请介绍一下插件",
        validate: function (value) {
            if (value!='') {
                return true;
            }
            return '请输入插件描述';
        }
    }]
    inquirer.prompt(questions).then((answers) => {
        let _answers = JSON.parse(JSON.stringify(answers))
        let desc = _answers.desc
        let gitconfig=path+'/plugins/'+op.name+'/.git/config'
        let config= util.readProperties(gitconfig)
        // console.log(config)
        let giturl=config['\turl ']
        if(giturl==''){
            log.fatal('您还未把此插件发布到github,请先发布！')
            return
        }
        let p={}
        p.url=giturl
        p.desc=desc
        op.desc=desc
        op.url=giturl
        updatePlugin(op)
        // console.log(p)
        net.post(base+'add.do',p , {} ,(res)=>{
            res=JSON.parse(res)
            // console.log(res)
            if(res.err==0){
                log.info('发布成功！')
            }else{
                log.info(res.msg)
            }

        })

    })
}

function updatePlugin(op){
    var path=  process.cwd();
    path=path+'/plugins/'+op.name+'/plugin.json'
    let j={}
    j.name=op.name
    j.desc=op.desc
    // console.log('SSS='+JSON.stringify(j))
    let str = JSON.stringify(j,"","\t")
    // console.log('SSS='+str)
    fs.writeFileSync(path, str)

}


module.exports={excute}