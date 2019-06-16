var inquirer = require('inquirer')

const file = require('./file')
const clone = require('./clone')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')


function makeProject() {
    var questions = [{
        type: 'input',
        name: 'project',
        default: function () {
            return 'weexplus-demo';
        },
        message: "请输入项目名称.",
        validate: function (value) {
            var pass = value.match(/^[0-9a-z\-_]+$/i);
            if (pass) {
                return true;
            }

            return 'Your input contain illegal character, please try again.';
        }

    }, {
        type: 'input',
        name: 'appId',
        default: function () {
            return 'com.farwolf.demo';
        },
        message: "请输入appId.",
        validate: function (value) {
            if(value=='')
            {
                return '请输入appid，以点号分隔，例如(com.baidu.app)';
            }
            return true
        }
    }, {
        type: 'input',
        name: 'appName',
        default: function () {
            return '淘宝';
        },
        message: "请输入app的名称.",
        validate: function (value) {

            return value != ''
        }
    }]
    inquirer.prompt(questions).then((answers) => {
        let _answers = JSON.parse(JSON.stringify(answers))
        let {project,appName , appId} = _answers
        const targetDir = path.join(process.cwd(), _answers.project)
        fs.stat(targetDir, (err, stat) => {

            const rootPath = process.cwd()
            console.log(path.join(process.cwd(), _answers.project))
            if (err) {
                startClone(targetDir, _answers.project, _answers.appId, _answers.appName)
            } else {
                inquirer.prompt([{
                    type: 'confirm',
                    message: `已存在名为${_answers.project}的目录，是否覆盖？`,
                    name: 'ok'
                }]).then(answers => {
                    if (answers.ok) {
                        rimraf(targetDir, () => {
                            startClone(targetDir, _answers.project, _answers.appId, _answers.appName)
                        })
                    }
                }).catch(console.error)
            }
        })

    })
}


function startClone(targetDir, project, appid, name) {
    // fs.mkdirSync(targetDir)
    file.del(targetDir)
    clone.download(project, appid, name);

}


module.exports = {
    makeProject

};



