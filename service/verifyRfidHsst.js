const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';
const self = module.exports = {
    hoDetails: async (req, res, next) => {
        let id = req.params;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN        
                CCTECHAGRI.rfid_pkg.Rfid_Tag_Verify(:P_Rfid_Tag ,:P_RFID_Data,:P_Ho_Number,:P_Status_id,:P_Status_Message);
                END;`,
                {
                    P_Rfid_Tag: {
                        type: oracledb.VARCHAR2, dir: oracledb.BIND_IN,
                        val: id.id.toString()
                    },//'E2801170200010967CE309FD',  // Bind type is determined from the data.  Default direction is BIND_IN
                    P_RFID_Data: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                    P_Ho_Number: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_id: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Message: { val: 'result', dir: oracledb.BIND_INOUT },
                    // o:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }

                }
            );

            console.log(id);

            const resultSet1 = result.outBinds.P_RFID_Data;

            console.log("Cursor metadata:");
            //console.log(resultSet1.metaData);
            const oraColumns = resultSet1.metaData;
            const rows1 = await resultSet1.getRows();  // no parameter means get all rows
            // console.log(JSON.stringify(rows1));
            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);

            let jsonObj = JSON.parse(oraResult);
            //console.log(oraResult);
            let { P_Ho_Number, P_Status_id, P_Status_Message } = jsonObj;

            const Rfid_Details = await self.parseObject(oraColumns, rows1);
            const response = { Ho_no: P_Ho_Number, Rfid_Data: Rfid_Details, status: P_Status_id, message: P_Status_Message };
            console.log({ jsonObj });
            res.setHeader('Content-Type', 'application/json');
            res.status(200);
            res.send(JSON.stringify(response));
            // if (P_Status_id === '1') {
            //     res.status(200);
            //     res.send(JSON.stringify(response));
            // } else {
            //     res.status(401);
            //     res.send(P_Status_Message);
            // }

        } catch (err) {
            console.error(err);
            console.log('Connection pool error hhst verifyService'+err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.log('Connection pool error hsst verifyService'+err);
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