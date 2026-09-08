export async function GET() {
  return Response.json(
    { service: "RankSushi", status: "ok", version: "1.0.0" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
