// Returns Mike's latest ORIGINAL uploads. Stub: 501 unless YOUTUBE_API_KEY is set.
const CHANNEL_UPLOADS = "UUO_VdxgqgGOrtzSUmTV9iBw";
// Exclude clips of other speakers and Shorts.
const BLOCK = [/#shorts/i, /\.\.by /i, /\bby (alex hormozi|joe rogan|simon sinek|oprah|kobe|jordan peterson|mark cuban|jay shetty|steve harvey)/i, /podcast key takeaways/i];
const ALLOW_IDS = new Set([]); // force include ids here
const BLOCK_IDS = new Set(["NbtO-QSpZ1c", "dX1dwmsUcOM"]);
exports.handler = async () => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { statusCode: 501, body: JSON.stringify({ error: "not configured" }) };
  try {
    const u = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=${CHANNEL_UPLOADS}&key=${key}`;
    const r = await fetch(u);
    if (!r.ok) return { statusCode: 502, body: JSON.stringify({ error: "upstream" }) };
    const j = await r.json();
    const videos = (j.items || []).map(i => ({
      id: i.snippet.resourceId.videoId, title: i.snippet.title, published: (i.snippet.publishedAt || "").slice(0, 10)
    })).filter(v => ALLOW_IDS.has(v.id) || (!BLOCK_IDS.has(v.id) && !BLOCK.some(re => re.test(v.title)))).slice(0, 12);
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=0, s-maxage=3600" }, body: JSON.stringify({ videos }) };
  } catch (e) { return { statusCode: 502, body: JSON.stringify({ error: "failed" }) }; }
};
