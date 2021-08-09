var express = require('express');
var router = express.Router();
const mysql = require('../plugins/mysql');
var method = require('../plugins/method')

const TronWeb = require('tronweb')
const tronWeb = new TronWeb({
    fullHost: 'https://api.shasta.trongrid.io',
    // headers: { "TRON-PRO-API-KEY": 'your api key' },
    privateKey: '3d9fd9b7ffb1f6fe12528c09cc0df803a6170c6a385530b8ea29533162961bd4'
})

router.post('/getContractList', async (req, res) => {
    try {
        const {
            state,
            gameName,
            startTime,
            endTime,
            page,
            size
        } = req.body;
        let sql = "SELECT t.game_name,c.contract_address,c.end_block as contract_time,c.last_result,c.state,c.is_show as contract_is_show,c.pass_lock,g.title,g.is_show,g.type_game_id,g.game_id,g.end_time,g.is_auto_pass,g.clear_time from (game as g join contract_list as c on c.game_id = g.game_id) INNER JOIN type_game_list as t on t.type_game_id = g.type_game_id where 1=1"
        let str = ""
        if (state) {
            str += ` and c.state ='${state}'`;
        }
        if (gameName) {
            str += ` and t.game_name like '%${game_name}%'`;
        }
        if (startTime && endTime) {
            str += `and g.end_time >='${startTime}' and g.end_time <='${endTime}''`;
        }

        sql += str;

        if (page && size) {
            sql += ` order by g.game_id desc limit ${(parseInt(page) - 1) * parseInt(size)},${parseInt(size)}`;
        }

        let currentBlock = await method.getBlockNumber()
        let timestamp = await method.getTimestamp()

        let data = await mysql.query(sql);

        for (let i = 0; i < data.length; i++) {
            data[i].title = JSON.parse(data[i].title)
            if (data[i].contract_time) {
                data[i].contract_time = (data[i].contract_time - currentBlock) * 3 + timestamp
              }
            try {
                const fairGame = await tronWeb.contract().at(data[i].contract_address);
                let pause = await fairGame.pause().call()
                data[i].is_pause = pause
            } catch (e) {
                continue
            }
        }
        res.json({
            code: 200,
            message: 'table表获取成功',
            data: {
                record: data,
                total: data.length
            }
        });
    } catch (e) {
        console.error(e)
        res.json({
            code: 404,
            data: '错误'
        });
    }
});

router.post('/updateState', async (req, res) => {
    try {
        const {
            is_auto_pass,
            contract_is_show,
            pass_lock,
            contract_address
        } = req.body;

        let pre = `update contract_list set `;
        let tail = ` where contract_address='${contract_address}'`
        let str = ""
        // if (is_auto_pass) {
        //     str += `  is_auto_pass = ${is_auto_pass},`;
        // }
        if (contract_is_show) {
            str += `  is_show = ${contract_is_show},`;
        }
        if (pass_lock) {
            str += `  pass_lock = ${pass_lock},`;
        }

        if (str != "") {
            str = (str.substring(str.length - 1) == ',') ? str.substring(0, str.length - 1) : str;
        } else {
            res.json({
                code: 200,
                message: '无接收到需要修改的参数',
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
        console.error(e)
        res.json({
            code: 404,
            data: '错误'
        });
    }
});

router.post('/settlementList', async (req, res) => {
    try {
        const {
            game_id,
            contract_address
        } = req.body;

        let sql = `select game_detail from game where game_id = '${game_id}'`
        let data = await mysql.query(sql)

        if (!(data[0].game_detail) || (data.length == 0)) {
            res.json({
                code: 200,
                data: []
            });
            return
        }

        const fairGame = await tronWeb.contract().at(contract_address);

        let gameState = await fairGame.getState().call()
        let game_detail = JSON.parse(data[0].game_detail)

        await detailCheck(gameState[3], game_detail)

        res.json({
            code: 200,
            data: game_detail
        });
    } catch (el) {
        console.error(el)
        res.json({
            code: 404,
            data: '错误'
        });
    }
});

async function detailCheck(odds, game_detail) {
    for (let j = game_detail.length; j > 0; j--) {
        for (let d = game_detail[j - 1].detail.length; d > 0; d--) {
            odds[game_detail[j - 1].detail[d - 1].modulo - 1] = await tronWeb.toBigNumber(odds[game_detail[j - 1].detail[d - 1].modulo - 1]._hex).toNumber()
            if (odds[game_detail[j - 1].detail[d - 1].modulo - 1] == 0 || odds[game_detail[j - 1].detail[d - 1].modulo - 1] == null || odds[game_detail[j - 1].detail[d - 1].modulo - 1] == NaN) {
                game_detail[j - 1].detail.splice(d - 1, 1);
            } else {
                game_detail[j - 1].detail[d - 1].odds = (odds[game_detail[j - 1].detail[d - 1].modulo - 1]) / 100
                delete game_detail[j - 1].detail[d - 1].max_odds
                delete game_detail[j - 1].detail[d - 1].min_odds
            }
            if (game_detail[j - 1].detail.length == 0) {
                game_detail.splice(j - 1, 1)
            }
        }
    }
}

module.exports = router;