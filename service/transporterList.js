const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';
const self=module.exports = {
   
    TrList: async (req, res) => {
        const id = req.params;
        console.log(id.id);
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN        
                 
                CCTECHAGRI.cms_cc_pkg.Transporter_LIST(:P_login_Cd ,:P_TList_Details,:P_Status_Cd,:P_Status_Message);
                 END;`,
                {
                    P_login_Cd: {type: oracledb.NUMBER, dir: oracledb.BIND_IN ,val: Number(id.id)},      
                    P_TList_Details:{ type: oracledb.CURSOR, dir : oracledb.BIND_OUT },
                    P_Status_Cd: { type: oracledb.NUMBER, dir: oracledb.BIND_INOUT },
                    P_Status_Message: { type: oracledb.STRING, dir: oracledb.BIND_INOUT },
                    // o:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }

                }
            );

            // console.log(result.outBinds);

            const resultSet1 = result.outBinds.P_TList_Details;

            console.log("Cursor metadata:");
            //console.log(resultSet1.metaData);
            const rows1 = await resultSet1.getRows();  // no parameter means get all rows
          
            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);
           
            let jsonObj = JSON.parse(oraResult);
            const oraColumns = resultSet1.metaData;
          
           const trList = await self.parseObject(oraColumns, rows1);
            let { P_Login_Cd, P_Login_Name, P_Status_Cd, P_Status_Message } = jsonObj;
            const response = { id: id,TrList: trList, user: P_Login_Name, status: P_Status_Cd, P_Status_Message};
            console.log({ P_Status_Cd });
            res.setHeader('Content-Type', 'application/json');
            if (P_Status_Cd ===1) {
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
    addKeyValue:async(obj, key, data)=>{
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
                self.addKeyValue(row,element, rows[r][i])
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