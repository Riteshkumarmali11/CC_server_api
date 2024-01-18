const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');

const self = module.exports = {

    plantationList: async (req, res) => {
        const { id, p_farmer_id } = req.body;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN        
                 CCTECHAGRI.cms_cc_pkg.Farmer_Plantation_List(:P_login_Cd ,:p_farmer_id,
                     :P_Farmer_Plant_List_Data,:P_Status_id,:P_Status_Message);             

                END;`,
                {
                    P_login_Cd: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: id },
                    p_farmer_id: { type: oracledb.VARCHAR2, dir: oracledb.BIND_IN, val: p_farmer_id },
                    P_Farmer_Plant_List_Data: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                    P_Status_id: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Message: { val: 'result', dir: oracledb.BIND_INOUT },
                    // o:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }

                }
            );

            // console.log(result.outBinds);

            const resultSet1 = result.outBinds.P_Farmer_Plant_List_Data;

            console.log("Cursor metadata:");
            //console.log(resultSet1.metaData);
            const rows1 = await resultSet1.getRows();  // no parameter means get all rows

            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);

            let jsonObj = JSON.parse(oraResult);
            const oraColumns = resultSet1.metaData;

            const plList = await self.parseObject(oraColumns, rows1);
            let { P_Login_Cd, P_Login_Name, P_Status_id, P_Status_Message } = jsonObj;
            const response = { id: id, PlList: plList, user: P_Login_Name, status: P_Status_id, P_Status_Message };
            console.log({ P_Status_id });
            res.setHeader('Content-Type', 'application/json');
            if (P_Status_id === '1') {
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
    addKeyValue: async (obj, key, data) => {
        obj[key] = data;
    },
    parseObject: async (columns, rows) => {
        let col = columns.map(Element => Element.name)
        // console.log('columns',col);
        // console.log('rows',rows);
        let parsedObject = [];
        let i = 0;
        let r = 0;
        rows.forEach(rowElement => {
            let row = {};
            col.forEach(element => {
                self.addKeyValue(row, element, rows[r][i])
                // val[element] = rows[r][i]
                // row.push(val)
                // console.log(val);
                i++;
            });
            parsedObject.push(row);
            r++;
            i = 0;
        })

        return parsedObject;

    }
}