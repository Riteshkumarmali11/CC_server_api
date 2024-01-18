const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');
let libPath;

const self = module.exports = {
    farmerinfo: async (req, res) => {
        const {p_farmer_id } = req.body;
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

                    m_farmer_id_detail_cur: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }



                }
            );

            console.log(result.outBinds);
            const resultSet1 = result.outBinds.m_farmer_id_detail_cur;

           
            const rows1 = await resultSet1.getRows();  // no parameter means get all rows
            console.log(JSON.stringify(rows1));
//const oraColumns = resultSet1.metaData;
            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);

            res.setHeader('Content-Type', 'application/json');
           

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
        console.log('parsedObject', parsedObject);
        return parsedObject;

    }
}