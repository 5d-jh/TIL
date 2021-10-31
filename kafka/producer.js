const { Kafka } = require("kafkajs");

const msg = process.argv[2];

run();

async function run() {
  try {
    const kafka = new Kafka({
      clientId: "myapp",
      brokers: ["localhost:9092"],
    });

    const producer = kafka.producer();
    console.log("connecting...");
    await producer.connect()
    console.log("connected!");

    // A-M: 0, N-Z: 1

    const partition = msg[0] < "N" ? 0 : 1;

    const result = await producer.send({
      topic: 'Users',
      messages: [{
        value: msg,
        partition,
      }]
    });

    console.log(`sent! ${JSON.stringify(result)}`);
    await producer.disconnect();
  } catch (e) {
    console.error(`Somthing bad happened ${e}`)
  } finally {
    process.exit();
  }
}
