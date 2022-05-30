#쉘 스크립트: 명령어 출력후 수행
set -x


#체인코드 설치->피어
docker exec cli peer chaincode install -n simpleasset -v 1.1 -p github.com/simpleasset/1.1
sleep 3

#체인코드 업그레이드->채널
#docker exec cli peer chaincode upgrade -n simpleasset -v 1.1 -C mychannel -c '{"Args":[]}' -P 'AND("Org1MSP.member")'
docker exec cli peer chaincode instantiate -n simpleasset -v 1.1 -C mychannel -c '{"Args":[]}' -P 'AND("Org1MSP.member")'
sleep 3

#체인코드 쿼리-인보크-쿼리
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["set","c","300"]}'
sleep 3
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["set","d","400"]}'
sleep 3
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["transfer","c","d","400"]}' #잔액 모자람
sleep 3
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["transfer","c","e","400"]}' #계좌검증 오류
sleep 3
docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["transfer","c","d","40"]}' #정상
sleep 3

docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get","c"]}' #잔액 검사
docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["get","d"]}'

docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["history","d"]}' #트랜젝션 이력 조회

docker exec cli peer chaincode invoke -n simpleasset -C mychannel -c '{"Args":["del","d"]}' #WS 삭제
sleep 3
docker exec cli peer chaincode query -n simpleasset -C mychannel -c '{"Args":["history","d"]}'