import { NextResponse } from "next/server";
import { api, checked } from "@/lib/server/http";
import { requireProject } from "@/lib/server/auth";
import { toCsv } from "@/lib/utils";
export const GET = api(async (request, { params }) => {
  const { db, project, workspace } = await requireProject((await params).id);
  const q = new URL(request.url).searchParams;
  const dataset = q.get("dataset") === "csv" ? "csv" : "detail";
  const rows =
    checked(
      await db
        .from("gsc_daily")
        .select(
          "date,query,page,country,device,search_type,clicks,impressions,position,dataset",
        )
        .eq("project_id", project.id)
        .eq("workspace_id", workspace.id)
        .eq("property", project.gsc_property || project.url)
        .eq("dataset", dataset)
        .order("date", { ascending: false })
        .limit(1000),
    ) || [];
  if (q.get("format") === "csv")
    return new Response(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="ranksushi-search-console.csv"',
      },
    });
  return NextResponse.json({
    rows,
    limit: 1000,
    note: "Most recent 1,000 detailed records. API rows are not exhaustive.",
  });
});
