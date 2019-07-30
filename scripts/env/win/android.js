const setEnv = require('../setEnv')
var inquirer = require('inquirer')
setEnv.doCmd('java -version','Java',(res)=>{
    if(!res){
        var questions = [{
            type: 'confirm',
            name: 'path',
            message: "jdk没有安装，是否前去下载？",
            validate: function (value) {
                return true
            }

        }]
        inquirer.prompt(questions).then((answers) => {

        })
    }
})