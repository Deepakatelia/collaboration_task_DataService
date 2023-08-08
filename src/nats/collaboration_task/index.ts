import { addDays } from "date-fns";
import { NatsConnection, StringCodec, Subscription, connect } from "nats";
import { nat_server } from "../../../admin";
import { collaborationStore } from "../../kafka/collaboration_task/index";
console.log(nat_server)
export class CollaborationNats {
  async collaborationNatsSubscriber(nc: NatsConnection) {
    const sc = StringCodec();
    const sub = nc.subscribe("collaboration_tasks");
    (async (sub: Subscription) => {
      console.log(`listening for ${sub.getSubject()} requests...`);
      for await (const m of sub) {
        const decoder = new TextDecoder("utf-8");
        var payload = JSON.parse(decoder.decode(m.data));

        if (payload.type == "getAll") {
          const finalRes: any = collaborationStore
          if (m.respond(sc.encode(JSON.stringify(finalRes)))) {
            console.info(`[collaboration] handled #${sub.getProcessed()}`);
          } else {
            console.log(
              `[collaboration] #${sub.getProcessed()} ignored - no reply subject`
            );
          }
        }
        else if(payload.type == "get"){
          const finalres = collaborationStore[payload.id]
          if (finalres) {
            if (m.respond(sc.encode(finalres))) {
                console.info(`[collaboration] handled #${sub.getProcessed()}`)
            } else {
                console.log(`[collaboration] #${sub.getProcessed()} ignored - no reply subject`)
            }
          }
          else {
              console.log("not found")
              if (m.respond(sc.encode("404"))) {
                  console.info(`[collaboration] handled #${sub.getProcessed()}`)
              } else {
                  console.log(`[collaboration] #${sub.getProcessed()} ignored - no reply subject`)
              }
          }


        }
      }
      console.log(`subscription ${sub.getSubject()} drained.`);
    })(sub);
  }
}
