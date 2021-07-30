var express = require('express');
var router = express.Router();
const mysql = require('../plugins/mysql');

router.post('/getGameList', async (req, res) => {
  try {
    const {
      gameName,
      startTime,
      endTime,
      page,
      size
    } = req.body;
    let sql =
      "SELECT t.game_name,g.title,g.min_chip,g.max_chip,g.is_show,g.type_game_id,g.game_id,g.end_time,g.is_squad,g.max_bet,g.min_bet,g.game_detail,g.end_block,g.is_auto_pass,g.clear_block from game as g join type_game_list as t on t.type_game_id = g.type_game_id where 1=1";
    let totalSql = 'select count(*) as total from game where 1=1';
    let str = ""
    if (gameName) {
      str += ` and t.game_name like '%${gameName}%'`;
    }
    if (startTime && endTime) {
      str += ` and g.end_time >='${startTime}' and g.end_time <='${endTime}'`;
    }

    sql += str;
    totalSql += str;


    if (page && size) {
      sql += ` order by g.game_id desc limit ${(parseInt(page) - 1) * parseInt(size)},${parseInt(size)}`;
    }
    let data = await mysql.query(sql);
    for (let i = 0; i < data.length; i++) {
      data[i].game_detail = JSON.parse(data[i].game_detail)
      data[i].title = JSON.parse(data[i].title)
    }
    const total = await mysql.query(totalSql);
    res.json({
      code: 200,
      message: 'table表获取成功',
      data: {
        record: data,
        total: total[0].total
      }
    });
  } catch (el) {
    console.error(el)
    res.json({
      code: 404,
      data: '错误'
    });
  }
});

router.post('/getDetailModel', async (req, res) => {
  try {
    const {
      type_game_id
    } = req.body;
    let sql =
      `select detail_model from type_game_list where type_game_id = ${type_game_id}`
    let data = await mysql.query(sql);

    if (data.length == 1 && data.length == 0 && data[0].detail_model == null && data[0].detail_model == '') {
      res.json({
        code: 200,
        data: []
      })
    } else {
      data[0].detail_model = JSON.parse(data[0].detail_model)
      res.json({
        code: 200,
        data: data
      })
    }
  } catch (el) {
    console.error(el)
    res.json({
      code: 404,
      data: '错误'
    });
  };
});

router.post('/addGameList', async (req, res) => {
  try {
    let {
      title,
      min_chip,
      max_chip,
      is_show,
      type_game_id,
      end_time,
      max_bet,
      min_bet,
      game_detail,
      end_block,
      is_auto_pass,
      clear_block,
      is_squad
    } = req.body;
if(is_squad){
  
}
    if (title) {
      title = JSON.stringify(title);
    }
    if (game_detail) {
      game_detail = JSON.stringify(game_detail);
    }
    if (end_time) {
      end_time = end_time / 1000;
    }
    let sql =
      `INSERT INTO game(title,min_chip,max_chip,type_game_id,is_show,end_time,max_bet,min_bet,game_detail,end_block,is_auto_pass,clear_block,is_squad) VALUES('${title}',${min_chip},${max_chip},${type_game_id},${is_show},${end_time},${max_bet},${min_bet},'${game_detail}',${end_block},${is_auto_pass},${clear_block},${is_squad})`;

    await mysql.query(sql);

    res.json({
      code: 200,
      message: '添加成功',
    })
  } catch (el) {
    console.error(el)
    res.json({
      code: 404,
      data: '错误'
    });
  };
});

router.post('/editGameList', async (req, res) => {
  try {
    let {
      game_id,
      title,
      min_chip,
      max_chip,
      is_show,
      type_game_id,
      end_time,
      max_bet,
      min_bet,
      game_detail,
      end_block,
      is_auto_pass,
      clear_block,
      is_squad
    } = req.body;
    let pre = `update game set `;
    let tail = ` where game_id='${game_id}'`
    let str = ""
    if (title) {
      title = JSON.stringify(title)
      str += `  title = '${title}',`;
    }
    if (min_chip) {
      str += `  min_chip = ${min_chip},`;
    }
    if (max_chip) {
      str += `  max_chip = ${max_chip},`;
    }
    if (is_show) {
      str += `  is_show = ${is_show},`;
    }
    if (type_game_id) {
      str += `  type_game_id = '${type_game_id}',`;
    }
    if (end_time) {
      let temp = new String(end_time)
      if (temp.length >= 12) end_time = end_time / 1000
      str += `  end_time = ${end_time},`;
    }
    if (max_bet) {
      str += `  max_bet = '${max_bet}',`;
    }if (is_squad) {
      str += `  is_squad = '${is_squad}',`;
    }
    if (min_bet) {
      str += `  min_bet = '${min_bet}',`;
    }
    if (game_detail) {
      game_detail = JSON.stringify(game_detail)
      str += `  game_detail = '${game_detail}',`;
    }
    if (end_block) {
      str += `  end_block = '${end_block}',`;
    }
    if (is_auto_pass) {
      str += `  is_auto_pass = '${is_auto_pass}',`;
    }
    if (clear_block) {
      str += `  clear_block = '${clear_block}',`;
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

router.post('/deleteGameList', async (req, res) => {
  try {
    const {
      game_id
    } = req.body;
    let sql =
      `delete from game where game_id = '${game_id}'`;

    await mysql.query(sql);

    res.json({
      code: 200,
      message: '删除成功',
    })
  } catch (el) {
    console.error(el)
  };
});


module.exports = router;