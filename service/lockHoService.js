const fs = require('fs');
const oracledb = require('oracledb');
const { getEnabledCategories } = require('trace_events');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';

const self = module.exports = {
    lockHo : async (req, res, next) => {
        const { id, hoNo,remark,flag,reason  } = req.body;
        
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                //(P_login_Cd in Number,P_ho_no in Number,P_LOCK_FLAG Varchar2,P_REMARKS Varchar2,P_Status_Cd Out Number, P_Status_Message Out Varchar2
               
                `BEGIN        
                CCTECHAGRI.cms_cc_pkg.HO_ORDER_LOCK(:P_login_Cd,:P_ho_no,:P_LOCK_FLAG,
                        :P_REMARKS,:P_LOCK_REASON,:P_Status_Cd,:P_Status_Message);
               
                END;`,
                {
                    P_login_Cd: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: id },
                    P_ho_no: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: hoNo },
                    P_LOCK_FLAG: {type:oracledb.String, dir: oracledb.BIND_IN ,val: flag},
                    P_REMARKS:  { type: oracledb.STRING, dir: oracledb.BIND_IN, val: remark},
                    P_LOCK_REASON:  { type: oracledb.STRING, dir: oracledb.BIND_IN, val: reason},
                    P_Status_Cd: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Message: { val: 'result', dir: oracledb.BIND_INOUT },

                }
            );

       

            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);
            console.log(oraResult);
            let jsonObj = JSON.parse(oraResult);
            console.log(jsonObj);
            let { P_Status_Cd,P_Status_Message } = jsonObj;
           
            const response = {
                status:P_Status_Cd,status_message:P_Status_Message
            };

            res.setHeader('Content-Type', 'application/json');

            if (P_Status_Cd === '1') {
                res.status(200);
                res.send(JSON.stringify(response));
            } else {
                res.status(401);
                res.send(P_Status_Message);
            }

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
}