const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');

const self = module.exports = {
  
   

   plantationDetail: async (req, res) => {
      
    const { id, p_farmer_id } = req.body;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);

            const result = await connection.execute(
                `BEGIN        
                   
                     
                CCTECHAGRI.FARMER_PKG.farmer_plantation_detail (:p_farmer_id,:p_plot_no,:M_Plantation_Detail_Cur);

                END;`,
                {
                   
                    p_farmer_id: { type: oracledb.VARCHAR2, dir: oracledb.BIND_IN, val: p_farmer_id},
                    p_plot_no: { type: oracledb.VARCHAR2, dir: oracledb.BIND_IN },
                    M_Plantation_Detail_Cur: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
                   

                }
            );

             console.log(result.outBinds);

            const resultSet1 = result.outBinds.M_Plantation_Detail_Cur;

            console.log("Cursor metadata:");
            console.log(resultSet1.metaData);
            const rows1 = await resultSet1.getRows();  // no parameter means get all rows
            const oraColumns = resultSet1.metaData;
            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);

            let jsonObj = JSON.parse(oraResult);
           
            const fList = await self.parseObject(oraColumns, rows1);
          
           
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