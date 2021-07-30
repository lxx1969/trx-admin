var express = require('express');
var router = express.Router();
const mysql = require('../plugins/mysql');
const {
    setToken,
    getToken
} = require('../plugins/token');



router.post('/getTypeList', async (req, res) => {
    try {
        const sql = "select type_name,type_logo,type_id,type_picture from type_list "
        const typeSql = "select game_name,type_game_id,stream,detail_model,type_name_list,modulo_list from type_game_list where type_id = ? "

        let key = 0;
        let array = new Array()
        let type_list = await mysql.query(sql)

        for (let i = 0; i < type_list.length; i++) {
            let game_list = await mysql.query(typeSql, [type_list[i].type_id])
            let length = game_list.length
            let child = new Array();
            for (let j = 0; j < length; j++) {
                let temp = {
                    title: game_list[j].game_name,
                    id: game_list[j].type_game_id,
                    key: key + j + 1
                }
                child.push(temp)
            }
            let data = {
                title: type_list[i].type_name,
                value: type_list[i].type_logo,
                type_id: type_list[i].type_id,
                type_picture: type_list[i].type_picture,
                key: key,
                child: child
            }
            key = key + length + 1
            array.push(data)
        }
        res.json({
            code: 200,
            data: array
        });
    } catch (error) {
        console.error(error)
        res.json({
            code: 404,
            data: '错误'
        });
    }
});

router.post('/addType', async (req, res) => {
    try {
        let {
            type_logo,
            type_name,
            type_picture
        } = req.body;

        let sql =
            `INSERT INTO type_list(type_logo,type_name,type_picture) VALUES('${type_logo}','${type_name}','${type_picture}')`;

        await mysql.query(sql);

        res.json({
            code: 200,
            message: '添加成功',
        });
    } catch (el) {
        console.error(el)
        res.json({
            code: 404,
            data: '错误'
        });
    }
});

router.post('/addTypeGame', async (req, res) => {
    try {
        const {
            game_name,
            is_show,
            stream,
            type_id
        } = req.body;

        let sql =
            `INSERT INTO type_game_list(game_name,is_show,stream,type_id) VALUES('${game_name}',${is_show},${stream},${type_id})`;

        await mysql.query(sql);

        res.json({
            code: 200,
            message: '添加成功',
        });
    } catch (el) {
        console.error(el)
        res.json({
            code: 404,
            data: '错误'
        });
    }
});

router.post('/editTypeGame', async (req, res) => {
    try {
        let {
            type_game_id,
            game_name,
            is_show,
            stream,
            type_id,
            detail_model
        } = req.body;


        let modulo_list = new Array()
        let type_name_list = new Array()

        let pre = `update type_game_list set`;
        let tail = ` where type_game_id = ${type_game_id}`
        let str = ""
        if (game_name) {
            str += `  game_name = '${game_name}',`;
        }
        if (stream) {
            str += `  stream = '${stream}',`;
        }
        if (is_show) {
            str += `  is_show = '${is_show}',`;
        }
        if (type_id) {
            str += `  type_id = '${type_id}',`;
        }
        if (detail_model) {
            for (let i = 0; i < detail_model.length; i++) {
                let game_type = detail_model[i].game_type
                for (let j = 0; j < detail_model[i].detail.length; j++) {
                    type_name_list.push(game_type)
                    modulo_list.push({
                        "team": detail_model[i].detail[j].team,
                        "betName": game_type
                    })
                }
            }
            modulo_list = {
                "list": modulo_list
            }
            type_name_list = {
                "list": type_name_list
            }

            detail_model = JSON.stringify(detail_model);
            modulo_list = JSON.stringify(modulo_list)
            type_name_list = JSON.stringify(type_name_list)

            str += `  detail_model = '${detail_model}',modulo_list = '${modulo_list}',type_name_list = '${type_name_list}',`;
        }
        if (str != "") {
            str = (str.substring(str.length - 1) == ',') ? str.substring(0, str.length - 1) : str;
        } else {
            res.json({
                code: 200,
                message: '无参数',
            });
        }
        let sql = pre + str + tail
        var conn = await mysql.getConnection();
        await mysql.beginTransaction(conn);
        await mysql.query2(conn, sql);
        await mysql.commit(conn);
        res.json({
            code: 200,
            message: '修改成功',
        });
    } catch (e) {
        mysql.rollback(conn);
        console.log(e);
        res.json({
            code: -1,
            message: '修改失败'
        });
    }
});

router.post('/editType', async (req, res) => {
    try {
        let {
            type_id,
            type_name,
            type_logo,
            type_picture
        } = req.body;

        let pre = `update type_list set`;
        let tail = ` where type_id = ${type_id}`
        let str = ""
        if (type_name) {
            str += `  type_name = '${type_name}',`;
        }
        if (type_logo) {
            str += `  type_logo = '${type_logo}',`;
        }
        if (type_picture) {
            str += `  type_picture = '${type_picture}',`;
        }
        if (str != "") {
            str = (str.substring(str.length - 1) == ',') ? str.substring(0, str.length - 1) : str;
        } else {
            res.json({
                code: 200,
                message: '无参数',
            });
        }
        let sql = pre + str + tail
        var conn = await mysql.getConnection();
        await mysql.beginTransaction(conn);
        await mysql.query2(conn, sql);
        await mysql.commit(conn);
        res.json({
            code: 200,
            message: '修改成功',
        });
    } catch (e) {

        mysql.rollback(conn);
        console.log(e);
        res.json({
            code: -1,
            message: '修改失败'
        });
    }
});

router.post('/deleteTypeList', async (req, res) => {
    try {
        const {
            type_id,
            type_game_id
        } = req.body;

        let sql = ''
        if (!type_id && type_game_id) {
            sql = `delete from type_game_list where type_game_id = '${type_game_id}'`;
        } else if (type_id && !type_game_id) {
            sql = `DELETE type_game_list,type_list from type_list LEFT JOIN type_game_list ON type_list.type_id=type_game_list.type_id WHERE type_list.type_id='${type_id}'`
        } else {
            res.json({
                code: 404,
                data: '无删除id'
            });
        }

        var conn = await mysql.getConnection();
        await mysql.beginTransaction(conn);
        await mysql.query2(conn, sql);
        await mysql.commit(conn);

        res.json({
            code: 200,
            message: '删除成功',
        });
    } catch (el) {
        mysql.rollback(conn);

        console.error(el)
        res.json({
            code: 404,
            data: '错误'
        });
    }
});

module.exports = router;