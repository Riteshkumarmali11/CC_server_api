const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');

//libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';
const self = module.exports = {
    // CCTECHAGRI.cms_cc_pkg.Farmer_Plantation_List(:P_login_Cd ,:p_farmer_id,
    //     :p_farmer_plant_List_data,:P_Status_id,:P_Status_Message);   
   

   farmerData: async (req, res) => {
        const { id, p_farmer_id } = req.body;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN        
                
                     
                     CCTECHAGRI.FARMER_PKG.farmer_search (:p_farmer_id,:p_farmer_plant_List_data);

                END;`,
                {
                   
                    p_farmer_id: { type: oracledb.VARCHAR2, dir: oracledb.BIND_IN, val: p_farmer_id },
                    p_farmer_plant_List_data: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
                    // P_Status_id: { val: 'true' },
                    // P_Status_Message: { val: 'SUCCESS'},
                    // o:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }

                }
            );

            // console.log(result.outBinds);

            const resultSet1 = result.outBinds.p_farmer_plant_List_data;

            console.log("Cursor metadata:");
            //console.log(resultSet1.metaData);
            const rows1 = await resultSet1.getRows();  // no parameter means get all rows

            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);

            let jsonObj = JSON.parse(oraResult);
            const oraColumns = resultSet1.metaData;

            const fList = await self.parseObject(oraColumns, rows1);
           // let { P_Login_Cd, P_Login_Name, P_Status_id, P_Status_Message } = jsonObj;
           //let {  p_farmer_id, p_farmer_plant_List_data } = jsonObj;
            const response = {  FList: fList };
            res.send(JSON.stringify(response));
           // const response = { id: id, FList: fList, user: p_farmer_id };
            console.log({ response });
           // res.setHeader('Content-Type', 'application/json');
            // if (status === '1') {
            //     res.status(200);
            //     res.send(JSON.stringify(response));
            // } else {
            //     res.status(401);
            //     res.send(P_Status_Message);
            // }

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
                 //console.log(val);
                i++;
            });
            parsedObject.push(row);
            r++;
            i = 0;
        })

        return parsedObject;

    }
}