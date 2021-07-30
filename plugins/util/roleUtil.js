
const { getToken } = require('../token');
const mysql = require('../mysql');


exports.userPermission = async function (req, res,next) {
try{
    var url = req.baseUrl
    const token = req.headers.authorization;
    const temp = await getToken(token);
    var sql = `SELECT r.menu FROM tb_user as u JOIN tb_role as r ON u.role = r.role WHERE u.flag = 1 and u.id = '${temp.id}'`
    var userMenu = await mysql.query(sql);

    let hasPower = false;
    userMenu.forEach(el => {
        let permission = el.menu.split(',')
        for(let i = 0;i < permission.length;i++){
            if (permission[i] == url) {
                hasPower = true;
            }
        }
    });

    if (!hasPower) {
        if (req.xhr) {
            return res.json({
                state: false,
                msg: "抱歉，您无此权限！请联系管理员"
            });
        }
        return res.send('抱歉，您无此权限！请联系管理员');
    }}catch(error){
        return res.json({
            state: false,
            msg: "系统错误，请稍后再试"
        });
    }
    next();
};

