const fs = require('fs');
const oracledb = require('oracledb');
const { getEnabledCategories } = require('trace_events');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';

const self = module.exports = {
    permissionSlip : async (req, res, next) => {
        const { id, porder,vehicleNo,tcode,remark,slipType } = req.body;
        
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);
            const result = await connection.execute(

                              
                    `BEGIN        
                      CCTECHAGRI.cms_cc_pkg.Ho_Permission_slip(			
                        :P_login_cd,
                        :P_slip_Cd	,
                        :P_Slip_Type,
                        :P_Order_no	,
                        :P_T_Code ,
                        :P_Extension_tonns,
                        :P_VEHICLE_NO ,
                        :P_JOINT_LOAD_ORDER_NO_1 ,
                        :P_JOINT_ORDER_LOCATION1,
                        :P_LOCK_FLAG_ORDER_NO_1  ,
                        :P_JOINT_LOAD_ORDER_NO_2 ,
                        :P_JOINT_ORDER_LOCATION2	,
                        :P_LOCK_FLAG_ORDER_NO_2  ,
                        :P_JOINT_LOAD_ORDER_NO_3 ,
                        :P_JOINT_ORDER_LOCATION3,
                        :P_LOCK_FLAG_ORDER_NO_3  ,
                        :P_REMARKS ,
                        :P_Status_Cd,
                        :P_status_Message
                        );
                    END;`,                        
               
                {
                    P_login_Cd: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: id },
                    P_slip_Cd: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: slipType },
                    P_Slip_Type:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: "HO PERMISSION SLIP" },
                    P_Order_no: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: porder },
                    P_T_Code :{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: tcode},
                    P_Extension_tonns: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: 0 },
                    P_VEHICLE_NO:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: vehicleNo },
                    
                    
                    P_JOINT_LOAD_ORDER_NO_1:{ type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: null },
                    P_JOINT_ORDER_LOCATION1:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: 'UT1' },
                    P_LOCK_FLAG_ORDER_NO_1:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: "L" }, 
                   
                    P_JOINT_LOAD_ORDER_NO_2:{ type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: null },
                    P_JOINT_ORDER_LOCATION2:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: 'UT2' },
                    P_LOCK_FLAG_ORDER_NO_2:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: "L" }, 

                    P_JOINT_LOAD_ORDER_NO_3:{ type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: null },
                    P_JOINT_ORDER_LOCATION3:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: 'UT3' },
                    P_LOCK_FLAG_ORDER_NO_3:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: "L" }, 
                
                    P_REMARKS:  { type: oracledb.STRING, dir: oracledb.BIND_IN, val: remark},
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