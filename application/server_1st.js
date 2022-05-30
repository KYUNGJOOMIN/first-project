// 1. 모듈포함
const express = require('express');
var bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');

const { FileSystemWallet, Gateway } = require('fabric-network');

// 1.1 객체 생성 
const app = express();

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

// 4. REST api 라우팅
// 4.1 asset POST
app.post('/asset', async (request, response) => {
    const key = request.body.key;
    const value = request.body.value;
    console.log('/asset-post-' + key + '-' + value);

    // 인증서작업 -> user1
    const walletPath = path.join(process.cwd(), 'wallet') // 추가 필요 작업 1. 외부모듈 추가
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.exists(userid);//id
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        // 클라이언트에서 인증서에 관한 안내 HTML을 보내줘야 함
        response.status(401).sendFile(__dirname + '/unauth.html'); //추가 필요 작업 2. unauth.html 작성
        return;
    }
    //게이트웨이 연결
    const gateway = new Gateway(); //추가 필요 작업 3. 연결정도 connection.json 파일로드 -> parse to ccp
    await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: false } });//id
    //채널 연결
    const network = await gateway.getNetwork('mychannel');
    //체인코드 연결
    const contract = network.getContract('simpleasset');
    //트랜젝션처리
    await contract.submitTransaction('set', key, value);
    console.log('Transaction has been submitted');
    //게이트 웨이 연결 해제
    await gateway.disconnect();
    // 결과 클라이언트에 전송
    // result.html수정 
    const resultPath = path.join(process.cwd(), '/views/result.html')
    var resultHTML = fs.readFileSync(resultPath, 'utf8');
    resultHTML = resultHTML.replace("<div></div>", "<div><p>Transaction has been submitted</p></div>");
    response.status(200).send(resultHTML);
});


// 4.2 asset GET
app.get('/asset', async (request, response) => {
    const key = request.query.key;
    console.log('/asset-get-' + key);

    const walletPath = path.join(process.cwd(), 'wallet') // ~/dev/first-project/application/wallet
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.exists(userid);
    if (!userExists) {
        console.log('An identity for the user does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        response.status(401).sendFile(__dirname + '/unauth.html');
        return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userid, discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('simpleasset');
    const txresult = await contract.evaluateTransaction('get', key);
    console.log('Transaction has been evaluated: ' + txresult);
    await gateway.disconnect();

    const resultPath = path.join(process.cwd(), '/views/result.html')
    var resultHTML = fs.readFileSync(resultPath, 'utf8');
    resultHTML = resultHTML.replace("<div></div>", `<div><p>Transaction has been evaluated: ${txresult}</p></div>`);
    response.status(200).send(resultHTML);
});


// 5. 서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);