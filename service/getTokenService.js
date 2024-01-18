const fs = require('fs');
const oracledb = require('oracledb');
const { getEnabledCategories } = require('trace_events');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';

const self = module.exports = {
    getToken : async (req, res, next) => {
        let id = req.params;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN        
               
                Gsmagri.rfid_pkg.RFID_SLIP_Data(:P_ho_no,:P_RFID_TOKEN_Details,:P_Token_no,:P_Slip_no,
                    :P_Season_name,:P_In_Date,:P_T_Code,:P_T_name,:P_Vehicle_no,
                    :P_Farmer_id,:P_Farmer_name,:P_Cluster_name,:P_Village_Name,:P_Road_Distance,
                    :P_Diesel_Qty,:P_Status_Cd,:P_Status_Message);
               
                END;`,
                {
                    P_ho_no: { type: oracledb.VARCHAR2, dir: oracledb.BIND_IN, val: 0 },
                    P_RFID_TOKEN_Details:{ type: oracledb.CURSOR, dir : oracledb.BIND_OUT },
                    P_Token_no: { val: 'result', dir: oracledb.BIND_IN ,val: id.id.toString()},
                    P_Season_name: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_In_Date: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_T_Code: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_T_name: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Vehicle_no: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Farmer_id: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Farmer_name: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Cluster_name: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Village_Name: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Road_Distance: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Diesel_Qty: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Slip_no: { val: 'result', dir: oracledb.BIND_IN ,val:0},
                    P_Status_Cd: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Message: { val: 'result', dir: oracledb.BIND_INOUT },

                }
            );

            console.log(id);

            const resultSet1 = result.outBinds.P_RFID_TOKEN_Details;
            const oraColumns = resultSet1.metaData;

            const rows1 = await resultSet1.getRows();

            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);
            console.log(oraResult);
            let jsonObj = JSON.parse(oraResult);
            console.log(jsonObj);
            let { P_login_Cd,P_ho_no,P_TOKEN_NO,P_Season_name,P_In_Date,P_T_Code,P_T_name,P_Vehicle_no,
                P_Farmer_id,P_Farmer_name,P_Cluster_name,P_Village_Name,P_Road_Distance,P_Diesel_Qty,
                P_Slip_No,P_Status_Cd,P_Status_Message } = jsonObj;
            const HoToken = await self.parseObject(oraColumns, rows1);
            const response = {user_id:P_login_Cd,ho_no:P_ho_no,toke_no : P_TOKEN_NO,slip_no:P_Slip_No,
                season_name : P_Season_name,
                indate:P_In_Date,tcode:P_T_Code,tname:P_T_name,vehicle_no:P_Vehicle_no,
                farmer_id:P_Farmer_id,farmer_name:P_Farmer_name,cluster_name:P_Cluster_name,village_name:P_Village_Name
                ,road_distance:P_Road_Distance,diesel_qty:P_Diesel_Qty,
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
    },
    parseObject: async (columns, rows) => {
        let col = columns.map(Element => Element.name)
        // console.log('columns',col);
        // console.log('rows',rows);
        let parsedObject = [];
        let i = 0;
        let r = 0;
        rows.forEach(rowElement => {
            col.forEach(element => {
                let val = {}
                val[element] = rows[r][i++]
                parsedObject.push(val)
            });
            r++;
        })

        return parsedObject;

    }
}