#쉘 스크립트: 명령어 출력후 수행
set -x

# basic-network cli 컨테이너 수행
#docker-compose -f docker-compose.yml up -d cli
#docker-compose -f /home/bstudent/fabric-samples/basic-network/docker-compose.yml up -d cli

#체인코드 설치->피어
docker exec cli peer chaincode install -n simpleasset -v 1.0 -p github.com/simpleasset/1.0
sleep 3

#체인코드 배포->채널
docker exec cli peer chaincode instantiate -n simpleasset -v 1.0 -C mychannel -c '{"Args":["a","100"]}' -P 'AND("Org1MSP.member")'
sleep 3

#체인코드 쿼리-인보크-쿼리
docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get","a"]}'
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["set","b","200"]}'
sleep 3

docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get","b"]}'