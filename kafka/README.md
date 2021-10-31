# Kafka
[참고 강의](https://youtu.be/R873BlNVUB4) (⚠️잘못 이해한 부분이 있을 수 있음)

## 용어 정리
`Topic`: 논리적으로 구분되는 메시지 집합

`Partition`: db에서 데이터가 많아지면 샤딩을 하듯, 로드밸런싱을 위해 토픽 내에서 특정 기준으로 분할함(예: 홀/짝)

`Consumer group`: 컨슈머 관점에서 파티션을 고려하면 복잡도가 증가하므로, 파티션 추상화를 위해 도입되는 개념. 
> 예) Group 한 개, Cosumer 한 개, Partition 두 개가 있는 경우 => Consumer 1이 두 개의 파티션을 모두 처리함 <br />
> Group 한 개, Cosumer 두 개, Partition 두 개가 있는 경우 => 각각의 consumer가 각각의 파티션을 처리함

Consumer/Partition 규칙: 동일한 그룹 내에서, 하나의 컨슈머가 여러개의 파티션을 처리할 수 있지만, 여러개의 컨슈머가 하나의 파티션을 처리할 순 없다.
> 예) Group 한 개, Cosumer 두 개, Partition 두 개가 있는 경우 => Group에 더 이상 새로운 Consumer를 추가할 수 없음

## Queue vs. Pub/Sub
### Queue
하나의 메시지는 한 번만 처리될 수 있음
> 예) 수강신청 대기열

### Pub/Sub
하나의 이벤트(=메시지)가 발생하면 여러 곳에서 병렬적으로 처리할 수 있음(브로드캐스팅)
> 예) 동영상 업로드 이벤트 발생 => 인코딩, 저작권 체크, 자동자막 생성을 병렬적으로 처리

### Kafka
Kafka가 특이한 점은 Queue처럼 사용할 수도 있고, Pub/Sub처럼 사용할 수도 있다는 것임
* Queue 처럼 사용: 모든 컨슈머를 하나의 그룹에 넣는다
* Pub/Sub 처럼 사용: 여러개의 그룹을 생성한 다음 컨슈머를 각각의 그룹에 넣는다

## 분산 시스템
여러 개의 Kafka broker가 존재할 때, leader에 메시지가 쓰이면 follower가 따라서 씀. 같은 토픽 내에서 partition에 따라 리더가 다를 수 있음(즉 일방적인 관계가 아님).
아래 그림을 보면, broker 9092가 users topic의 partition 1 의 leader이고, broker 9093이 users topic의 partition 2 의 leader이다.
 
<img width="984" alt="Follower" src="https://user-images.githubusercontent.com/24839897/139593771-969bc4f7-a08a-4242-a854-56f3ce6401d2.png">

여기서, 어떤 브로커가 어떤 파티션의 리더인지를 관리하는 역할을 Zookeeper 라는 친구가 한다. 강의하는 사람은 딱히 마음에 들어하진 않는듯..

## 장/단점
### 장점
* Append only commit log: producer는 항상 특정 파티션 끝에 메시지를 붙이게 됨
* 그러므로 성능이 좋음
* 분산 시스템으로 구성할 수 있음
* Long polling: RabbitMQ와 차별화되는 부분. 브로커가 컨슈머에게 메시지를 전달하는 푸시 모델과 달리, 카프카는 컨슈머가 수시로 브로커를 조회(Polling)하여 메시지를 처리한다.
  * Long polling은 한 번 컨슈머가 조건을 지정하여 요청을 하면, 지정한 조건을 만족하여 브로커가 메시지를 전달해줄 때까지 대기하는 것이다. 예) 메시지가 700바이트 쌓일 때 전달해 주세요. 그 이전까진 요청 후 계속 대기…
* Event driven: 마이스로서비스에서, 각 서비스마다 직접 통신하는 대신 Kafka를 거쳐 이벤트 드리븐 아키텍처로 설계할 수 있음
* Pub/Sub과 Queue를 한 번에 사용할 수 있음
* 확장이 용이함: 성능이 딸리면 새 브로커를 쉽개 도입할 수 있음
* 병렬 처리: 하나의 토픽을 여러 개의 파티션으로 나눠서 병렬적으로 처리할 수 있음

### 단점
* Zookeeper의 존재: 전체 시스템 정상 작동 여부가 Zookeeper 하나에 의해 결정됨, 대규모 시스템에서 이상하게 작동되는 부분이 있음
* Producer가 파티셔닝에 직접 관여함: 복잡도가 증가하며 시스템 오류 발생 확률이 높아짐(그래서 vitess.io 같은 샤딩 솔루션이 존재)
* 설치, 설정, 관리가 복잡함
