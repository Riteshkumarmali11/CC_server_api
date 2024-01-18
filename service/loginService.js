const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('./../dbconfig');
const auth = require('./../middleware/auth');

module.exports = {
    login:async (req,res)=>{
        const { email, password } = req.body;
        let connection;
        try {

            oracledb.createPool(dbConfig);
            console.log('Connection pool started');
            connection = await oracledb.getConnection(dbConfig);
            const result = await connection.execute(
                `BEGIN
        CCTECHAGRI.cms_cc_pkg.Auth_Login(:P_Username,:P_Password, :P_Login_Cd,:P_user_Tag ,:P_Login_Name, :P_status_cd,:P_Status_Message);
       -- gsmagri.farmer_pkg.Farmer_ID_Detail(:P_FARMER_ID ,:M_Farmer_Id_Detail_Cur);
    
        END;`,
                {
                    P_Username: email,
                    P_Password: password,
                    P_Login_Cd: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_user_Tag: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Login_Name: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_status_cd: { val: 'result', dir: oracledb.BIND_INOUT },
                    P_Status_Message: { val: 'result', dir: oracledb.BIND_INOUT }
                }
            );

            let oraResult = {};
            oraResult = JSON.stringify(result.outBinds);
            console.log(oraResult);
            let jsonObj = JSON.parse(oraResult);
            let token = auth.getToken(jsonObj);
            let { P_Login_Cd, P_Login_Name, P_status_cd, P_Status_Message } = jsonObj;
            const response = { id: P_Login_Cd, user: P_Login_Name, status: P_status_cd,status_message: P_Status_Message, token: token };
            console.log({ response });
            res.setHeader('Content-Type', 'application/json');
            if (P_status_cd === '1') {
                res.status(200);
                res.send(JSON.stringify(response));
            } else {
                res.status(401);
                res.send(P_Status_Message);
            }
            console.log(P_status_cd);

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
    }
}