const { Kafka } = require("kafkajs");

run();

async function run() {
  try {
    const kafka = new Kafka({
      clientId: "myapp",
      brokers: ["localhost:9092"],
    });

    const admin = kafka.admin();
    console.log("connecting...");
    await admin.connect()
    console.log("connected!");

    await admin.createTopics({
      topics: [{
        topic: "Users",
        numPartitions: 2,
      }],
    });
    console.log("Created!");

    await admin.disconnect();
  } catch (e) {
    console.error(`Somthing bad happened ${e}`)
  } finally {
    process.exit();
  }
}
