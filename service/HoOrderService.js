const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';
const self=module.exports = {
    hoDetails: async (req, res) => {
        const id = req.params;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN        
                CCTECHAGRI.cms_cc_pkg.RFID_HO_Data(:P_login_Cd,:P_Ho_Number ,:P_RFID_HO_Details ,:P_Status_Cd,:P_Status_Message);
                END;`,
                {
                    P_login_Cd:491,
                    P_Ho_Number: {
                        type: oracledb.VARCHAR2, dir: oracledb.BIND_IN,
                        val: id.id.toString()
                    },//'E2801170200010967CE309FD',  // Bind type is determined from the data.  Default direction is BIND_IN
                    P_RFID_HO_Details: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                    P_Status_Cd: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Message: { val: 'result', dir: oracledb.BIND_INOUT },
                    // o:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }

                }
            );

            // console.log(result.outBinds);

            const resultSet1 = result.outBinds.P_RFID_HO_Details;

            //console.log("Cursor metadata:");
            //console.log(resultSet1.metaData);
            const rows1 = await resultSet1.getRows();  // no parameter means get all rows
            //console.log(JSON.stringify(rows1));
            const oraColumns=resultSet1.metaData;
            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);

            
            let jsonObj = JSON.parse(oraResult); 
            const Ho_Details=await self.parseObject(oraColumns,rows1);
            let { P_Ho_Number, P_Status_Cd, P_Status_Message } = jsonObj;
            const response = { Ho_Details: Ho_Details, status: P_Status_Cd, P_Status_Message};
            console.log("response",response);
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
        console.log('parsedObject',parsedObject);
        return parsedObject;

    }
}