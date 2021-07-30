var photoUtil = require('../plugins/util/photoUtils')
var express = require('express');
var router = express.Router();
var url = require("url")




router.post('/upload',photoUtil.upload.array('logo',99),function(req,res,next){
    try{
    fileFlag = req.files.length;
    var TheFile = req.files
    var RES = res
    var REQ = req
    let array = new Array()
    let host = req.headers.host
    for(let i = 0;i < fileFlag;i++){
        let path = req.files[i].path.replace(/\\/g,"/")
        path = path.replace('public/','')
    //    let url = 'https://'+ host +'/' + path
        let url = '/' + path
        array.push(url)
    }
    res.json({
        code: 200,
        message: '添加成功',
        data: array
    });}catch(el){
        console.error(el)
    }
  })

module.exports = router;