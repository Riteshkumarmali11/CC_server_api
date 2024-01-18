const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');

const self = module.exports = {
    insert_rfid: async (req, res, next) => {
        const { p_tag_id, p_reader_ip, p_datetime, p_reader_name } = req.body;
        let connection;
        try {
            // Create a connection pool (assuming dbConfig is properly defined)
            await oracledb.createPool(dbConfig);
            console.log('Connection pool started');

            // Acquire a connection from the pool
             connection = await oracledb.getConnection();
             const currentDate = new Date();
             
            // Format the date string using TO_DATE function
            const formattedDatetime = `TO_DATE('${currentDate}', 'YYYY-MM-DD HH24:MI:SS')`;

            // Execute the PL/SQL procedure // ${formattedDatetime},
            const result = await connection.execute(
                `BEGIN
                agbl.RFID_IN_OUT_TAG_INSERT(
                        :P_tag_id,
                        :P_reader_ip,                       
                        :P_reader_name,
                        :p_status_cd,
                        :P_Status_Message
                    );
                END;`,
                {
                    P_tag_id: { type: oracledb.STRING, dir: oracledb.BIND_IN, val: p_tag_id },
                    P_reader_ip: { type: oracledb.STRING, dir: oracledb.BIND_IN, val: p_reader_ip },
                    P_reader_name: { type: oracledb.STRING, dir: oracledb.BIND_IN, val: p_reader_name },
                    p_status_cd: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                    P_Status_Message: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                }
            );

            // Extract the output parameters from the result
            const { p_status_cd, P_Status_Message } = result.outBinds;

            const response = {
                status: p_status_cd,
                status_message: P_Status_Message
            };

            res.setHeader('Content-Type', 'application/json');
            if (p_status_cd === 1) {
                res.status(200).json(response);
            } else {
                res.status(401).send(P_Status_Message);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('An error occurred while processing the request.');
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
};
