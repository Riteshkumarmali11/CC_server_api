const secret = "iloveInsys21";
const tokenExpiresTime = "2000d";

module.exports = {
    getToken: function(user) {
        let {P_Username,P_Login_Cd}=user;
        const payload = { P_Username,P_Login_Cd};
        let jwt = jsonwebtoken
        let token = jwt.sign(payload, secret, {
            expiresIn: tokenExpiresTime // expires in 24 hours
        });
        return token;
    },
}

