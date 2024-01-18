const fs = require('fs');
const oracledb = require('oracledb');
const { getEnabledCategories } = require('trace_events');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';

const self = module.exports = {
    getLedData: async (req, res, next) => {
        let id = req.params;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);
            //(P_LED_DISPLAY_Details out sys_refcursor,P_Running_token out Varchar2, P_Token_Lot out Varchar2,  P_Status_Cd Out Number, P_Status_Message Out Varchar2
            const result = await connection.execute(
                `BEGIN        
               
                CCTECHAGRI.rfid_pkg.RFID_LED_DISPLAY(:P_LED_DISPLAY_Details,:P_Running_token,:P_Token_Lot ,:P_Status_Cd,:P_Status_Message);
               
                END;`,
                {
                    P_LED_DISPLAY_Details: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                    P_Running_token: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Token_Lot: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Cd: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Message: { val: 'result', dir: oracledb.BIND_INOUT },

                }
            );

            console.log(id);

            const resultSet1 = result.outBinds.P_LED_DISPLAY_Details;
            const oraColumns = resultSet1.metaData;

            const rows1 = await resultSet1.getRows();

            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);
            console.log(oraResult);
            let jsonObj = JSON.parse(oraResult);
            console.log("oraColumns " + oraColumns);

            const leddata = await self.parseObject(oraColumns, rows1);
            let { P_Running_token, P_Token_Lot, P_Status_Cd, P_Status_Message } = jsonObj;
            const response = { P_Running_token: P_Running_token, P_Token_Lot: P_Token_Lot, leddata: leddata, status: P_Status_Cd, P_Status_Message };

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
        //  console.log('columns',col.length);
        //  console.log('rows',rows);
        let parsedObject = [];
        let i = 0;
        let r = 0;
        rows.forEach(rowElement => {
            col.forEach(element => {
                let val = {}
                val[element] = rows[r][i]

                if (typeof rows[r][i] !== 'undefined' && rows[r][i]) {
                    parsedObject.push(val)
                }
                i++;
            });
            i = 0;
            r++;
        })

        return parsedObject;

    }
}