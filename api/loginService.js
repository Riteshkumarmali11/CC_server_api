const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');

// On Windows and macOS, you can specify the directory containing the Oracle
// Client Libraries at runtime, or before Node.js sarts.  On other platforms
// the system library search path must always be set before Node.js is started.
// See the node-oracledb installation documentation.
// If the search path is not correct, you will get a DPI-1047 error.
let libPath;
// if (process.platform === 'win32') {           // Windows
//   libPath = 'C:\\oracle\\instantclient_19_12';
// } else if (process.platform === 'darwin') {   // macOS
//   libPath = process.env.HOME + '/Downloads/instantclient_19_8';
// }

libPath = '192.168.5.10\D:\app\Arbar-pc\product\11.2.0\client_1';

async function run() {

  let connection;

  try {

    oracledb.createPool(dbConfig);
    console.log('Connection pool started');
    connection = await oracledb.getConnection(dbConfig);


    const result = await connection.execute(
      `BEGIN
       CCTECHAGRI.rfid_pkg.Auth_Login(:P_Username,:P_Password, :P_Login_Cd,:P_user_Tag ,:P_Login_Name, :P_status_cd,:P_Status_Message);
       -- gsmagri.farmer_pkg.Farmer_ID_Detail(:P_FARMER_ID ,:M_Farmer_Id_Detail_Cur);
    
        END;`,
      {
        // P_FARMER_ID: '348385',
        // M_Farmer_Id_Detail_Cur:{ type: oracledb.CURSOR, dir : oracledb.BIND_OUT },
        P_Username:  '',  // Bind type is determined from the data.  Default direction is BIND_IN
        P_Password: '',
        P_Login_Cd: { val: 'result', dir: oracledb.BIND_INOUT },
        P_user_Tag: { val: 'result', dir: oracledb.BIND_INOUT },
        P_Login_Name: { val: 'result', dir: oracledb.BIND_INOUT },
        P_status_cd: { val: 'result', dir: oracledb.BIND_INOUT },
        P_Status_Message:{ val: 'result', dir: oracledb.BIND_INOUT }        

      }
    );

    console.log(result.outBinds);
    // const resultSet1 = result.outBinds.M_Farmer_Id_Detail_Cur;

    // console.log("Cursor metadata:");
    // console.log(resultSet1.metaData);
    // const rows1 = await resultSet1.getRows();  // no parameter means get all rows
    // console.log(rows1);

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

run();