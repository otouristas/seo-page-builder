import { Inngest } from "inngest";
export const inngest = new Inngest({
  id: "ranksushi",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
