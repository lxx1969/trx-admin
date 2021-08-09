const TronWeb = require('tronweb')
const tronWeb = new TronWeb({
    fullHost: 'https://api.shasta.trongrid.io'
    // headers: { "TRON-PRO-API-KEY": 'your api key' },
    // privateKey: 'your private key'
})
const mysql = require('../plugins/mysql');

exports.getBlockNumber = async function () {
    try {
        const sql = "select value from dictionary where `key` = 'configuration' "
        let result = await mysql.query(sql)

        if (result[0]) {
            result = JSON.parse(result[0].value)
            result = result.block
        }
        if (!result) {
            result = await tronWeb.trx.getBlock('latest')
            result = result.block_header.raw_data.number
        }

        return result
    } catch (e) {
        console.error("method.getBlock ------------" + e)
        return false
    }
}

exports.getTimestamp = async function () {
    try {
        const sql = "select value from dictionary where `key` = 'configuration' "
        let result = await mysql.query(sql)

        if (result[0]) {
            result = JSON.parse(result[0].value)
            result = result.timestamp
        }
        if (!result) {
            result = await tronWeb.trx.getBlock('latest')
            result = result.block_header.raw_data.timestamp / 1000
        }

        return result
    } catch (e) {
        console.error("method.getBlock ------------" + e)
        return false
    }
}

exports.updateBlock = async function () {
    try {
        const sql = "select value from dictionary where `key` = 'configuration' "
        
        let result = await mysql.query(sql)
        if (result[0]) {
            result = JSON.parse(result[0].value)

            let block = await tronWeb.trx.getBlock('latest')
            result.block = block.block_header.raw_data.number
            result.timestamp = block.block_header.raw_data.timestamp/1000
            
            result = JSON.stringify(result)

            const update = `update dictionary set value = '${result}' where` + '`key`' + ` = 'configuration'`
            await mysql.query(update,result)

        }else throw new Error("更新区块失败  updateBlock")

        return result
    } catch (e) {
        console.error("method.isAddress ------------" + e)
        return false
    }
}

exports.isAddress = async function (address) {
    try {
        if (typeof (address) == "undefined") return false

        let result = tronWeb.isAddress(address)
        return result
    } catch (e) {
        console.error("method.isAddress ------------" + e)
        return false
    }
}