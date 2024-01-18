const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');
let libPath;
libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';
const self=module.exports = {
    // hoList
    tcqList: async (req, res) => {
        const id = req.params;
        console.log("ID "+id.id);


        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN                        
                CCTECHAGRI.cms_cc_pkg.TC_wt_queue_list (:p_login_cd,:p_tc_que_data,:P_Status_id,:P_Status_Message);
                END;`,
                {
                    P_login_Cd: {type: oracledb.NUMBER, dir: oracledb.BIND_IN ,val: Number(id.id)},//'E2801170200010967CE309FD',  // Bind type is determined from the data.  Default direction is BIND_IN
                    p_tc_que_data:{ type: oracledb.CURSOR, dir : oracledb.BIND_OUT },
                    P_Status_id: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Message: { val: 'result', dir: oracledb.BIND_INOUT },
                   
                }
            );

            // console.log(result.outBinds);

            const resultSet1 = result.outBinds.p_tc_que_data;

            console.log("Cursor metadata:");
            //console.log(resultSet1.metaData);
            const rows1 = await resultSet1.getRows();  // no parameter means get all rows
          
            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);
           
            let jsonObj = JSON.parse(oraResult);
            const oraColumns = resultSet1.metaData;
          
           const p_tc_que_data = await self.parseObject(oraColumns, rows1);
            let { P_Login_Cd, P_Login_Name, P_Status_id, P_Status_Message } = jsonObj;
            const response = { id: id,stcqList: p_tc_que_data, user: P_Login_Name, status: P_Status_id, P_Status_Message};
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