module.exports = {
    user          : "CCTECHAGRI",
  
    // Get the password from the environment variable
    // NODE_ORACLEDB_PASSWORD.  The password could also be a hard coded
    // string (not recommended), or it could be prompted for.
    // Alternatively use External Authentication so that no password is
    // needed.
    password      : "CCTECHAGRI",
  
    // For information on connection strings see:
    // https://oracle.github.io/node-oracledb/doc/api.html#connectionstrings
    connectString : "122.169.46.148/ORCL",
   
    // Setting externalAuth is optional.  It defaults to false.  See:
    // https://oracle.github.io/node-oracledb/doc/api.html#extauth
    externalAuth  : false
  };

//   DB_CONNECTION=oracle
// DB_HOST=192.168.5.245
// DB_PORT=1521
// DATABASE=GSMKK
// DB_SERVICE_NAME=GSMKK
// DB_USERNAME=ws_gsmagri
// DB_PASSWORD=wsgsmagri