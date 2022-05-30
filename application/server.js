// 1. 모듈포함
// 1.1 객체 생성 
const express = require('express');
const app = express();

var bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');


// 2. 서버설정
// 2.1 패브릭 연결설정
const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// 2.2 서버 속성 설정
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 3. HTML 라우팅

app.get('/', (request, response) => {  // callback 함수
    response.sendFile(__dirname + '/index.html');
})

// app.get('/create', (request, response)=>{  // callback 함수 
//     response.sendFile(__dirname + '/views/create.html');
// })

// app.get('/query', (request, response)=>{  // callback 함수 
//     response.sendFile(__dirname + '/views/query.html');
// })

// app.get('/transfer', (request, response)=>{  // callback 함수 
//     response.sendFile(__dirname + '/views/transfer.html');
// })

// 4. REST api 라우팅

// 4.1 asset POST
app.post('/asset', async (request, response) => {
    try{const key = request.body.key;
        const value = request.body.value;
        const userid = request.body.userid;
        console.log('/asset-post-' + key + '-' + value + '-' + userid);
    
        // 인증서작업 -> user1
        const walletPath = path.join(process.cwd(), 'wallet') // ~/dev/first-project/application/wallet
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    
        const userExists = await wallet.exists(userid);//id
        if (!userExists) {
            console.log(`An identity for the user ${userid} does not exist in the wallet`);//id
            console.log('Run the registerUser.js application before retrying');
            // 클라이언트에서 인증서에 관한 안내 HTML을 보내줘야 함
            // response.status(401).sendFile(__dirname + '/unauth.html');
            const res_str = `{"result": "failed", "msg" : "An identity for the user ${userid} does not exist in the wallet"}`; //respond 필요
            response.status(200).json(JSON.parse(res_str));
            return;
        }
    
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: false } });//id
    
        const network = await gateway.getNetwork('mychannel');
    
        const contract = network.getContract('simpleasset');
    
        await contract.submitTransaction('set', key, value);
        console.log('Transaction has been submitted');
    
        await gateway.disconnect();
        // 결과 클라이언트에 전송
        // result.html수정 
        // const resultPath = path.join(process.cwd(), '/views/result.html')
        // var resultHTML = fs.readFileSync(resultPath, 'utf8');
        // resultHTML = resultHTML.replace("<div></div>", "<div><p>Transaction has been submitted</p></div>");
        // response.status(200).send(resultHTML);
        const res_str = '{"result": "success", "msg" : "Transaction has been submitted"}'; //respond 필요
        response.status(200).json(JSON.parse(res_str));

    } catch(error){
        console.log('Error in /asset POST routhing')
        console.error(`Error in /asset POST routhing : ${error}`);
        const res_str = '{"result": "failed", "msg" : "Error in /asset POST routhing}'; //respond 필요
        response.json(JSON.parse(res_str));

    }
    
});


// 4.2 asset GET
app.get('/asset', async (request, response) => {
    try {
        const key = request.query.key; //query에서 꺼냄
        const userid = request.query.userid;
        console.log('/asset-get-' + key + '-' + userid);

        const walletPath = path.join(process.cwd(), 'wallet') // ~/dev/first-project/application/wallet
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const userExists = await wallet.exists(userid);
        if (!userExists) {
            console.log('An identity for the user does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            // response.status(401).sendFile(__dirname + '/unauth.html');
            const res_str = `{"result": "failed", "msg" : "An identity for the user ${userid} does not exist in the wallet"}`; //respond 필요
            response.json(JSON.parse(res_str));
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: false } });

        const network = await gateway.getNetwork('mychannel');

        const contract = network.getContract('simpleasset');

        const txresult = await contract.evaluateTransaction('get', key);
        console.log('Transaction has been evaluated: ' + txresult);

        await gateway.disconnect();
        const res_str = `{"result": "success", "msg" : ${txresult}}`;
        response.status(200).json(JSON.parse(res_str));

    } catch (error) {
        console.log('Error in /asset GET routhing')
        console.error(`Error in /asset GET routhing : ${error}`);
        const res_str = '{"result": "failed", "msg" : "Error in /asset GET routhing}'; //respond 필요
        response.json(JSON.parse(res_str));
    }

});

// 4.2 history 라우팅
app.get('/history', async (request, response) => {
    try {
        const key = request.query.key; //query에서 꺼냄
        const userid = request.query.userid;
        console.log('/history-get-' + key + '-' + userid);

        const walletPath = path.join(process.cwd(), 'wallet') // ~/dev/first-project/application/wallet
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const userExists = await wallet.exists(userid);
        if (!userExists) {
            console.log('An identity for the user does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            // response.status(401).sendFile(__dirname + '/unauth.html');
            const res_str = `{"result": "failed", "msg" : "An identity for the user ${userid} does not exist in the wallet"}`; //respond 필요
            response.json(JSON.parse(res_str));
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: false } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('simpleasset');
        const txresult = await contract.evaluateTransaction('history', key);
        console.log('Transaction has been evaluated: ' + txresult);

        await gateway.disconnect();
        const res_str = `{"result": "success", "msg" : ${txresult}}`;
        response.status(200).json(JSON.parse(res_str));

    } catch (error) {
        console.log('Error in /history GET routhing:', error.toString());
        console.error(`Error in /history GET routhing : ${error}`);
        const res_str = '{"result": "failed", "msg" : "Error in /history GET routhing}'; //respond 필요
        response.json(JSON.parse(res_str));
    }
});

//4.4 tx 라우팅
app.post('/tx', async (request, response) => {
    try{const fromkey = request.body.fromkey;
        const tokey = request.body.tokey;
        const amount = request.body.amount;
        const userid = request.body.userid;
        console.log('/asset-post-' + fromkey + '-' + tokey + '-' + amount + '-' + userid);
    
        // 인증서작업 -> user1
        const walletPath = path.join(process.cwd(), 'wallet') // ~/dev/first-project/application/wallet
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    
        const userExists = await wallet.exists(userid);//id
        if (!userExists) {
            console.log(`An identity for the user ${userid} does not exist in the wallet`);//id
            console.log('Run the registerUser.js application before retrying');
            // 클라이언트에서 인증서에 관한 안내 HTML을 보내줘야 함
            // response.status(401).sendFile(__dirname + '/unauth.html');
            const res_str = `{"result": "failed", "msg" : "An identity for the user ${userid} does not exist in the wallet"}`; //respond 필요
            response.status(200).json(JSON.parse(res_str));
            return;
        }
    
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: false } });//id
    
        const network = await gateway.getNetwork('mychannel');
    
        const contract = network.getContract('simpleasset');
    
        await contract.submitTransaction('transfer', fromkey, tokey, amount);
        console.log('Transaction has been submitted');
    
        await gateway.disconnect();
        // 결과 클라이언트에 전송
        // result.html수정 
        // const resultPath = path.join(process.cwd(), '/views/result.html')
        // var resultHTML = fs.readFileSync(resultPath, 'utf8');
        // resultHTML = resultHTML.replace("<div></div>", "<div><p>Transaction has been submitted</p></div>");
        // response.status(200).send(resultHTML);
        const res_str = `{"result": "success", "msg" : "Transaction has been submitted: ${fromkey}-${tokey}-${amount}"}`; //respond 필요
        response.status(200).json(JSON.parse(res_str));

    } catch(error){
        console.log('Error in /tx POST routhing')
        console.error(`Error in /tx POST routhing : ${error}`);
        const res_str = '{"result": "failed", "msg" : "Error in /tx POST routhing"}'; //respond 필요
        response.json(JSON.parse(res_str));

    }
    
});

// 4.3 /ADMIN POST 라우팅 ID, PW :admin-wallet.html
app.post('/admin', async (request, response) => {
    const id = request.body.id;
    const pw = request.body.passwd;

    try {
        //ca 접속
        const caURL = ccp.certificateAuthorities['ca.example.com'].url;
        const ca = new FabricCAServices(caURL);

        //기존 admin wallet 확인
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);

        const adminExists = await wallet.exists("admin");

        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            const res_str = '{"result": "failed", "msg" : "An identity for the admin user admin already exists in the wallet"}'; //respond 필요
            response.status(400).json(JSON.parse(res_str));
            return;
        }

        //admin 등록
        const enrollment = await ca.enroll({ enrollmentID: id, enrollmentSecret: pw });

        //인증서 발급
        const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import('admin', identity);

        //클라이언트에게 응답
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        const res_str = '{"result": "success", "msg" : "Successfully enrolled admin user admin and imported it into the wallet"}'; //respond 필요
        response.status(200).json(JSON.parse(res_str));

    } catch (error) {
        console.error(`Failed to enroll admin user "admin" : ${error}`);
        const res_str = `{"result": "failed", "msg" : "Failed to enroll admin user admin: ${error}"}`; //respond 필요
        response.json(JSON.parse(res_str));
    }
});


// 4.4 /UESR POST 라우팅 ID, USERROLE 
app.post('/user', async (request, response) => {
    const id = request.body.id;
    const userrole = request.body.userrole;
    console.log(id, userrole);

    try {
        //기존 admin wallet 확인
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists(id); //id 기등록 된 인증서가 없어야 합니다
        if (userExists) {
            console.log(`An identity for the user ${id} already exists in the wallet`);
            const res_str = '{"result": "failed", "msg" : "An identity for the user id already exist in the wallet"}'; //respond 필요
            response.status(400).json(JSON.parse(res_str));
            return;
        }

        const adminExists = await wallet.exists("admin"); // 관리자의 인증서는 있어야 합니다
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            const res_str = '{"result": "failed", "msg" : "An identity for the admin user admin does not exist in the wallet"}'; //respond 필요
            response.status(400).json(JSON.parse(res_str));
            return;
        }

        // 4. 게이트웨이 연결 ->admin identity 가져오기
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enable: false } });

        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        //5. register -> enroll -> import(저장)
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: id, role: userrole }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: id, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());

        wallet.import(id, userIdentity);

        console.log(`Successfully registered and enrolled admin user ${id} and imported it into the wallet`);
        const res_str = '{"result": "success", "msg" : "Successfully registered and enrolled admin user admin and imported it into the wallet"}'; //respond 필요
        response.status(200).json(JSON.parse(res_str));

    } catch (error) {
        console.error(`Failed to register user "${id}" : ${error}`);
        const res_str = `{"result": "failed", "msg" : "Failed to register user"}`; //respond 필요
        response.json(JSON.parse(res_str));
    }
});

// 5. 서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);