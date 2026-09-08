import { required, AppError } from "../server/errors";
import { providerJson } from "./http";
const locations: Record<string, number> = {
  US: 2840,
  GB: 2826,
  GR: 2300,
  CA: 2124,
  AU: 2036,
  DE: 2276,
  FR: 2250,
  ES: 2724,
  IT: 2380,
  NL: 2528,
  IN: 2356,
  BR: 2076,
};
export async function fetchSerp(
  keyword: string,
  country: string,
  language: string,
) {
  if (!locations[country])
    throw new AppError(
      "Live SERP lookup is not available for this project country yet.",
      400,
    );
  type Dfs = {
    tasks: {
      status_code: number;
      result: {
        items: {
          type: string;
          url: string;
          title: string;
          description: string;
          rank_absolute: number;
          rank_group: number;
        }[];
      }[];
    }[];
  };
  const data = await providerJson<Dfs>(
    "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${required("DATAFORSEO_LOGIN")}:${required("DATAFORSEO_PASSWORD")}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          keyword,
          location_code: locations[country],
          language_code: language,
          depth: 10,
        },
      ]),
    },
    60_000,
  );
  const task = data.tasks?.[0];
  if (task?.status_code !== 20000)
    throw new AppError(
      "The SERP provider could not complete that lookup.",
      502,
    );
  return {
    keyword,
    country,
    language,
    observedAt: new Date().toISOString(),
    source: "DataForSEO Google organic",
    results: (task.result?.[0]?.items || [])
      .filter((r) => r.type === "organic")
      .slice(0, 10),
  };
}
