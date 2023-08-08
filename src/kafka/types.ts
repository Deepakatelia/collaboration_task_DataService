import { CollaborationTopicsListening } from "./collaboration_task/index";

const collaborationTopicsService = new CollaborationTopicsListening();
export async function kafkaTopicsListening() {
  collaborationTopicsService.collaborationTopicsListening();
}
