const fs = require('fs');
const oracledb = require('oracledb');
const { getEnabledCategories } = require('trace_events');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';

const self = module.exports = {
    permissionSlip : async (req, res, next) => {
        const { id,  cluster_cd, village_cd, village_name, zip, road_dist, arial_dist, taluka_cd, district_cd, state_cd, nation_cd,} = req.body;
        
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);
            const result = await connection.execute(

                              
                    `BEGIN        
                       insert into Test_village_dir(			
                        
                        :P_cluster_cd,
                        :P_village_cd,
                        :P_village_name	,
                        :P_zip ,
                        :P_road_dist,
                        :P_arial_dist ,
                        :P_taluka_cd ,
                        :P_district_cd,
                        :P_state_cd  ,
                        :P_nation_cd 
                        
                        );
                    END;`,                        
               
                {
                    P_login_Cd: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: id },
                    P_cluster_cd: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: slipType },
                    P_village_cd:{ type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: "HO PERMISSION SLIP" },
                    P_village_name: { type: oracledb.STRING, dir: oracledb.BIND_IN, val: porder },
                    P_zip :{ type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: tcode},
                    P_road_dist: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: 0 },
                    P_arial_dist:{ type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: vehicleNo },
                    
                    
                    P_taluka_cd:{ type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: null },
                    P_district_cd:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: 'UT1' },
                    P_Status_Cd:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: "L" }, 
                   
                    P_nation_cd:{ type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: null },
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