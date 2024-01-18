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
    // connectString : "192.168.5.242/GSMKK",

  // connectString : "115.240.149.195/GSMKK",

  connectString : "122.169.46.148/ORCL",
    // Setting externalAuth is optional.  It defaults to false.  See:
    // https://oracle.github.io/node-oracledb/doc/api.html#extauth
    externalAuth  : false
  };
