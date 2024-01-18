const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');
let libPath;

const self = module.exports = {
  
   

    farmerInfoData: async (req, res) => {
      
       const {  p_farmer_id } = req.body;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN        
                   
                     
                CCTECHAGRI.FARMER_PKG.farmer_id_detail (:P_FARMER_ID, :m_farmer_id_detail_cur);

                END;`,
                {
                   
                    P_FARMER_ID: { type: oracledb.VARCHAR2, dir: oracledb.BIND_IN, val: p_farmer_id },

                    m_farmer_id_detail_cur: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                    // P_Status_id: { val: 'true' },
                    // P_Status_Message: { val: 'SUCCESS'},
                    // o:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }

                }
            );

             console.log(result.outBinds);

            const resultSet1 = result.outBinds. m_farmer_id_detail_cur;

            console.log("Cursor metadata:");
            //console.log(resultSet1.metaData);
            const rows0 = await resultSet1.getRows();  // no parameter means get all rows

            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);

            let jsonObj = JSON.parse(oraResult);
            const oraColumns = resultSet1.metaData;

            const fList = await self.parseObject(oraColumns, rows0);
           // let { P_Login_Cd, P_Login_Name, P_Status_id, P_Status_Message } = jsonObj;
           //let {  p_farmer_id, p_farmer_plant_List_data } = jsonObj;
            const response = {  FList: fList };
            res.send(JSON.stringify(response));
           // const response = { id: id, FList: fList, user: p_farmer_id };
            console.log({ response });
          

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
       
        let parsedObject = [];
        let i = 0;
        let r = 0;
        rows.forEach(rowElement => {
            let row = {};
            col.forEach(element => {
                self.addKeyValue(row, element, rows[r][i])
              
                i++;
            });
            parsedObject.push(row);
            r++;
            i = 0;
        })

        return parsedObject;

    }
}