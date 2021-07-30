const stringUtils = require("./util/StringUtils");
const mysql = require('./mysql');
const log = require('../core/logger').getLogger("system");
module.exports.saveLoginLog = async(id) => {
    // var user = req.session.user;
    var ip = stringUtils.getReqRemoteIp(req);
    log.info("客户端用户IP：",ip);
    await mysql.query("insert into tb_login_log(user_id,user_name,ip,login_time) values(?,(SELECT username from tb_user WHERE id = ?),?,?)", [id, id, ip, new Date()]);
};
module.exports.saveOperateLog = async(id, operations) => {
    // var user = req.session.user;
    await mysql.query("insert into tb_operation_logs(user_id,user_name,operations,operate_time) values(?,(SELECT username from tb_user WHERE id = ?),?,?)", [id, id, operations, new Date()]);
};