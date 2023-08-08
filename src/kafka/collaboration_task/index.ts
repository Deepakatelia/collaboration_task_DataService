import { Kafka } from "kafkajs";
import { kafka_server } from "../../../admin";
import { createAuditLog } from "../../../auditlog";
console.log(kafka_server)

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [kafka_server],
});
export var collaborationStore = {};

export class CollaborationTopicsListening {
  async collaborationTopicsListening() {
    const consumer = kafka.consumer({
      groupId: `collaboration_tasks_consumer-group`,
    });
    await consumer.connect();
    await consumer.subscribe({
      topic: "collaboration_tasks",
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async (data) => {
        const { message } = data;
        const operation = message.key.toString().split("#")[0];
        const key = message.key.toString().split("#")[1];
        if (operation == "create" && message.value) {
          const obj = JSON.parse(message.value.toString("utf8"));
          collaborationStore[key] = [obj];
          console.log("data sent to local", collaborationStore[key]);
        } else if (operation == "update" && message.value) {
          const obj = JSON.parse(message.value.toString("utf8"));
          collaborationStore[key] = JSON.stringify(obj)
          console.log("data updated", collaborationStore[key]);
        }
        else if (operation == "delete" && message.value) {
          const obj = JSON.parse(message.value.toString("utf8"));
          collaborationStore[key] = JSON.stringify(obj)        
      } 
      },
    });
    consumer.seek({ topic: "collaboration_tasks", partition: 0, offset: "0" });
  }
}
