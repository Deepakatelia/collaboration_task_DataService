import { addDays } from "date-fns";
import { NatsConnection, StringCodec, Subscription, connect } from "nats";
import { nat_server } from "../../../admin";
import { collaborationStore } from "../../kafka/collaboration_task/index";
console.log(nat_server);
export class CollaborationNats {
  async collaborationNatsSubscriber(nc: NatsConnection) {
    const sc = StringCodec();
    const sub = nc.subscribe("collaboration_task");
    (async (sub: Subscription) => {
      console.log(`listening for ${sub.getSubject()} requests...`);
      for await (const m of sub) {
        console.log("new requested");
        const decoder = new TextDecoder("utf-8");
        var payload = JSON.parse(decoder.decode(m.data));
        console.log("payload", payload);
        if (payload?.data?.type == "getAll") {
          const finalRes: any = collaborationStore;
          const finalResponse = Object.values(finalRes).filter(
            (item: any) => item?.isExist == true
          );

          if (m.respond(sc.encode(JSON.stringify(finalResponse)))) {
            console.info(`[collaboration] handled #${sub.getProcessed()}`);
          } else {
            console.log(
              `[collaboration] #${sub.getProcessed()} ignored - no reply subject`
            );
          }
        } else if (payload?.data?.type == "getOne") {
          const finalres = collaborationStore[payload?.data?.id];
          if (finalres) {
            if (m.respond(sc.encode(JSON.stringify({ data: finalres })))) {
              console.info(`[collaboration] handled #${sub.getProcessed()}`);
            } else {
              console.log(
                `[collaboration] #${sub.getProcessed()} ignored - no reply subject`
              );
            }
          } else {
            console.log("not found");
            if (m.respond(sc.encode("404"))) {
              console.info(`[collaboration] handled #${sub.getProcessed()}`);
            } else {
              console.log(
                `[collaboration] #${sub.getProcessed()} ignored - no reply subject`
              );
            }
          }
        }
      }
      console.log(`subscription ${sub.getSubject()} drained.`);
    })(sub);
  }
}
