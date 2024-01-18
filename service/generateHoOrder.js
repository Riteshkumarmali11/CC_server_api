const fs = require('fs');
const oracledb = require('oracledb');
const { getEnabledCategories } = require('trace_events');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';

const self = module.exports = {
    generateHo : async (req, res, next) => {
        //{"Farmer":"MEHEZABEEN MEHABOOB ARBAR","Plot_Number":"51","Ho_area":1.5,"Exp_Tonns":60,"T_name":"","H_name":"","Vehicle_no":"MH14-BM1844","Vehilce_Type":"T","T_Code":"12067001","Cane_Type":1,"H_Code":"18047004","Farmer_Id":"348385","Prority_No":"37","Agreement_Type":"ST","Prority_Flag":"HO ISSUED"}
        const { id, Farmer_Id,Plot_Number,Ho_area,Exp_Tonns,T_name,H_name,Vehicle_no,Vehilce_Type,T_Code,Cane_Type,H_Code,P_Priority_No,Agreement_Type,Prority_Flag,P_Gbl_Plant_id} = req.body;
        console.log(req.body);
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                

                
                    `BEGIN        
                        gsmagri.cms_cc_pkg.HO_TRAN_INSERT(			
                        :P_login_cd,
                        :P_Gbl_Plant_id	,
                        :P_Farmer_Id,
                        :P_Plot_No	,
                        :P_Priority_No,
                        :P_Cane_Type_Name,
                        :P_H_Code ,
                        :P_T_Code ,
                        :P_Vehicle_Type,
                        :P_Vehicle_No ,
                        :P_Order_no,
                        :P_Status_Cd,
                        :P_status_Message
                        );
                    END;`,                        
               
                {
                              
                    P_login_Cd: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: Number(id) },
                    P_Gbl_Plant_id: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: Number(P_Gbl_Plant_id) },
                    P_Farmer_Id:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val:Farmer_Id },
                    P_Plot_No: { type: oracledb.STRING, dir: oracledb.BIND_IN, val: Plot_Number },
                    P_Priority_No: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: Number(P_Priority_No) },
                    P_Cane_Type_Name :{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: Cane_Type},
                    P_H_Code :{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: H_Code},
                    P_T_Code :{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: T_Code},
                    P_Vehicle_Type:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: Vehilce_Type },
                    P_VEHICLE_NO:{ type: oracledb.STRING, dir: oracledb.BIND_IN, val: Vehicle_no },
                    P_Order_no: {  type: oracledb.STRING,val: 'result', dir: oracledb.BIND_INOUT },
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