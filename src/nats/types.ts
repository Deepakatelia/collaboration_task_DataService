import { connect } from "nats";
import { CollaborationNats } from "./collaboration_task/index";
import { nat_server } from "../../admin";
const CollaborationNatsService = new CollaborationNats();

export async function natsSubscriber() {
  const nc = await connect({ servers: nat_server })
    .then((con) => {
      console.log("nats cconnection success");
      return con;
    })
    .catch((err) => {
      console.log(`nats error: ${err}`);
      return null;
    });
  if (nc != null) {
    CollaborationNatsService.collaborationNatsSubscriber(nc);
  }
}
