const express = require('express');
const path = require('path');
const bodyparser = require("body-parser");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const cors = require('cors');
const { json } = require('body-parser');
global.jsonwebtoken = require('jsonwebtoken');
const LoginService=require("./service/loginService")
const VerifyRfid=require("./service/verifyRfid")
const verifyRfidHsst=require("./service/verifyRfidHsst")
const GenerateToken=require("./service/generateTokenService")
const GetToken=require("./service/getTokenService")
const FindToken=require("./service/findToken")
const HoService=require("./service/HoOrderService")
const hoLock=require("./service/lockHoService");
const HoListService = require('./service/HoListService');
const JoitOrderService = require('./service/jointOrderService');
const getPlantationList = require('./service/getPlantationList');
const harvesterList = require('./service/harvesterterList');
const transporterList = require('./service/transporterList');
const canTypeList= require('./service/caneTypeLsit');
const generateTokenWithJointOrder= require('./service/generateTokenForJointOrder');
const createHo=require('./service/generateHoOrder');
const ledData= require("./service/ledScreenService");
const tokenReprint= require("./service/TokenPrint");
const slip= require("./service/hoPermissionSlip");
const jointOrderList= require("./service/HopslipListService");

const app = express();

const port = process.env.PORT || 4000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))

app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

app.use(session({
    secret: uuidv4(), // 
    resave: false,
    saveUninitialized: true
}));
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))


app.post('/api/users/login', async (req, res, next) => {
    LoginService.login(req,res,next); 
});
app.post('/users/login', async (req, res, next) => {
    LoginService.login(req,res,next); 
});
app.get('/verify/rfid/:id', async (req, res, next) => {
    VerifyRfid.hoDetails(req, res, next)
});
app.get('/token/:id', async (req, res, next) => {
    GenerateToken.generateToken(req, res, next)
});

app.get('/token/view/:id', async (req, res, next) => {
    GetToken.getToken(req, res, next)
});

app.get('/ho/view/:id', async (req, res, next) => {
    HoService.hoDetails(req, res, next)
});

app.get('/token/find/:id', async (req, res, next) => {
    FindToken.findToken(req, res, next)
});
app.get('/holist/:id', async (req, res, next) => {
    HoListService.hoList(req, res)
});

app.post('/holock',async (req, res, next) => {
    hoLock.lockHo(req, res);
});

app.post('/plantlist', async (req, res, next) => {
    getPlantationList.plantationList(req, res);
});

app.get('/harvesterlist/:id', async (req, res, next) => {
    harvesterList.harvesterList(req, res)
});

app.get('/transporterlist/:id', async (req, res, next) => {
    transporterList.TrList(req, res)
});

app.get('/canelist/:id', async (req, res, next) => {
    canTypeList.caneTypeList(req, res)
});

app.post('/token/joint/order', async (req, res, next) => {
    generateTokenWithJointOrder.tokenList(req, res);
});

app.post('/joint/order', async (req, res, next) => {
    JoitOrderService.jointOrder(req, res);
});

app.post('/create/ho', async (req,res,next)=>{
    createHo.generateHo(req,res);
});

app.get('/leddata', async (req, res, next) => {
    ledData.getLedData(req, res)
});
app.get('/verify/hsst/rfid/:id', async (req, res, next) => {
    verifyRfidHsst.hoDetails(req, res, next)
});

app.post('/token/print', async (req, res, next) => {
    tokenReprint.tokenPrint(req, res)
});

app.post('/slip', async (req, res, next) => {
    slip.permissionSlip(req, res);
});


app.get('/permission/slip/:id', async (req, res, next) => {
    jointOrderList.pslipList(req, res)
});

//-------------------------------------duplicate api for internal network issue -----------------------

app.get('/api/verify/rfid/:id', async (req, res, next) => {
    VerifyRfid.hoDetails(req, res, next)
});

app.get('/api/token/:id', async (req, res, next) => {
    GenerateToken.generateToken(req, res, next)
});

app.get('/api/token/view/:id', async (req, res, next) => {
    GetToken.getToken(req, res, next)
});

app.get('/api/ho/view/:id', async (req, res, next) => {
    HoService.hoDetails(req, res, next)
});

app.get('/api/token/find/:id', async (req, res, next) => {
    FindToken.findToken(req, res, next)
});
app.get('/api/holist/:id', async (req, res, next) => {
    HoListService.hoList(req, res)
});

app.post('/api/holock',async (req, res, next) => {
    hoLock.lockHo(req, res);
});

app.post('/api/plantlist', async (req, res, next) => {
    getPlantationList.plantationList(req, res);
});

app.get('/api/harvesterlist/:id', async (req, res, next) => {
    harvesterList.harvesterList(req, res)
});

app.get('/api/transporterlist/:id', async (req, res, next) => {
    transporterList.TrList(req, res)
});

app.get('/api/canelist/:id', async (req, res, next) => {
    canTypeList.caneTypeList(req, res)
});

app.post('/api/token/joint/order', async (req, res, next) => {
    generateTokenWithJointOrder.tokenList(req, res);
});

app.post('/api/joint/order', async (req, res, next) => {
    JoitOrderService.jointOrder(req, res);
});

app.post('/api/create/ho', async (req,res,next)=>{
    createHo.generateHo(req,res);
});

app.get('/api/leddata', async (req, res, next) => {
    ledData.getLedData(req, res)
});
app.get('/api/verify/hsst/rfid/:id', async (req, res, next) => {
    verifyRfidHsst.hoDetails(req, res, next)
});

app.post('/api/token/print', async (req, res, next) => {
    tokenReprint.tokenPrint(req, res)
});

app.post('/api/slip', async (req, res, next) => {
    slip.permissionSlip(req, res);
});


app.get('/api/permission/slip/:id', async (req, res, next) => {
    jointOrderList.pslipList(req, res)
});





app.listen(port, () => { console.log("Lostening to the server on http://localhost:4000") });