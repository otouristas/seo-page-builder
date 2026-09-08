import captured from "./recorded-scene.json";
import type { PageSnapshot } from "../types";
import type { ResearchResult } from "../research";
export const RECORDED_SCENE = captured as {
  name: string;
  page: PageSnapshot;
  serps: ResearchResult[];
  disclosure: string;
};
