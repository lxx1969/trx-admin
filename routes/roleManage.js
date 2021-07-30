var express = require('express');
var router = express.Router();
const mysql = require('../plugins/mysql');
const {
    setToken,
    getToken
} = require('../plugins/token');



const map = new Map()
map.set("/api/userManage","/system/userManage")
map.set("/api/roleManage","/system/roleManage")
map.set("/api/editor","/components/editor")
map.set("/api/markdown","/components/markdown")
map.set("/api/userInfo","/userSystem/userInfo")
map.set("/api/setting","/userSystem/setting")

const mapOut = new Map()
mapOut.set("/system/userManage","/api/userManage")
mapOut.set("/system/roleManage","/api/roleManage")
mapOut.set("/components/editor","/api/editor")
mapOut.set("/components/markdown","/api/markdown")
mapOut.set("/userSystem/userInfo","/api/userInfo")
mapOut.set("/userSystem/setting","/api/setting")


router.post('/getRoleRoute', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const temp = await getToken(token);

        let sql = `SELECT r.menu FROM tb_user as u JOIN tb_role as r ON u.role = r.role WHERE u.flag = 1 and u.id = '${temp.id}'`;
        let result = await mysql.query(sql);
        let array = new Array();
        result = result[0].menu.split(",")
        for(let i = 0;i < result.length;i++){
            let temp = map.get(result[i])
            array.push(temp)
        }
        res.json({
            code: 200,
            message: '添加成功',
            data: array
        });
    } catch (e) {
        console.log(e);
        res.json({
            code: -1,
            message: '获取失败'
        });
    }
});

// export function getRoleTable(data) {
//     return request.post('/roleManage/roleTableData', data);
//   }

//   export function deleteRoleTable(data) {
//     return request.post('/roleManage/deleteRole', data);
//   }

//   export function editRole(data) {
//     return request.post('/roleManage/editRole', data);
//   }

//   export function addRole(data) {
//     return request.post('/roleManage/addRole', data);
//   }




router.post('/roleTableData', async (req, res) => {
    try {
        //   const { page, size } = req.body;
        let sql =
            "SELECT id,role,text,role from tb_role where 1=1";
        let totalSql = 'select count(*) as total from tb_role where 1=1';
        //   let str = ' and flag=1 ';
        //   if (role) {
        //     str += ` and role ='${role}'`;
        //   }
        //   if (username) {
        //     str += ` and username like '%${username}%'`;
        //   }
        //   if (startTime && endTime) {
        //     str += ` and createTime >='${startTime}' and createTime <='${endTime}'`;
        //   }

        //   sql += str;
        //   totalSql += str;

        //   sql += ` order by id desc limit ${(parseInt(page) - 1) * parseInt(size)},${parseInt(size)}`;
        const data = await mysql.query(sql);
        const total = await mysql.query(totalSql);
        res.json({
            code: 200,
            message: 'table表获取成功',
            data: {
                record: data,
                total: total[0].total
            }
        });
    } catch (e) {
        console.log(e);
    }
});

/**
 *  @description 添加用户
 *  @param {...userFrom}
 *  @return {*}
 */

router.post('/addRole', async (req, res) => {
    try {
        var {
            role,
            text,
            menu
        } = req.body;
        for(let i = 0;i < menu.length;i++){
         let temp = mapOut.get(menu[i])
         if(temp){
             menu[i] = temp
         }
        }

        menu = menu.toString()
        let sql = `INSERT INTO tb_role(role,text,menu) VALUES('${role}','${text}','${menu}')`;
        await mysql.query(sql);
        res.json({
            code: 200,
            message: '添加成功'
        });
    } catch (e) {
        console.log(e);
        res.json({
            code: -1,
            message: '添加失败'
        });
    }
});

/**
 *  @description 修改用户信息
 *  @param {...userFrom}
 *  @return {*}
 */

router.post('/editRole', async (req, res) => {
    try {

        // id:'2'
        // role:'text'
        // text:'普通用户，拥有一些常规权限111'
        var {
            role,
            text,
            menu,
            id
        } = req.body;
        for(let i = 0;i < menu.length;i++){
            let temp = mapOut.get(menu[i])
            if(temp){
                menu[i] = temp
            }
           }
           menu = menu.toString()
        let sql = `update tb_role set role='${role}',text='${text}',menu='${menu}' where id='${id}'`;
        await mysql.query(sql);
        res.json({
            code: 200,
            message: '修改成功'
        });
    } catch (e) {
        console.log(e);
        res.json({
            code: -1,
            message: '修改失败'
        });
    }
});

/**
 *  @description 删除
 *  @param {...userFrom}
 *  @return {*}
 */

router.post('/deleteRole', async (req, res) => {
    try {
        const {
            id
        } = req.body;
        let sql = `delete from tb_role where id = '${id}'`;
        await mysql.query(sql);
        res.json({
            code: 200,
            message: '删除成功'
        });
    } catch (e) {
        console.log(e);
        res.json({
            code: -1,
            message: '删除失败'
        });
    }
});


module.exports = router;