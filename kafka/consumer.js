const { Kafka } = require("kafkajs");

const msg = process.argv[2];

run();

async function run() {
  try {
    const kafka = new Kafka({
      clientId: "myapp",
      brokers: ["localhost:9092"],
    });

    const consumer = kafka.consumer({ groupId: "test" });
    console.log("connecting...");
    await consumer.connect()
    console.log("connected!");

    await consumer.subscribe({
      topic: 'Users',
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async result => {
        for (let index = 0; index < 100_000; index++) {
          Math.random();
        }
        console.log(`RVDMSG ${result.message.value} on partition ${result.partition}`);
      }
    });
  } catch (e) {
    console.error(`Somthing bad happened ${e}`)
  }
}
