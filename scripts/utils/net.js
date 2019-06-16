// let base='http://59.110.169.246:8080/plugin/';
let base='http://localhost:8080/';
function post(url,param,header,callback){
  var request = require('request');
  header['Content-Type']='application/x-www-form-urlencoded'
  var  options = {
    method: 'post',
    url: url,
    form: param,
    headers:header
  };

  request(options, function (err, res, body) {
    if (err) {
      callback(err)
    }else {
      callback(body)
    }
  })
}

module.exports={post,base}