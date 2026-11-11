const PAGE = __PAGE_CONTENT__;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

function jsonError(message, status) {
  return Response.json({ error: message }, { status: status, headers: JSON_HEADERS });
}

function contentType(path) {
  const extension = path.split(".").pop().toLowerCase();
  const types = {
    html: "text/html; charset=utf-8",
    htm: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "text/javascript; charset=utf-8",
    mjs: "text/javascript; charset=utf-8",
    json: "application/json; charset=utf-8",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    avif: "image/avif",
    gif: "image/gif",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf",
    mp4: "video/mp4",
    webm: "video/webm",
    txt: "text/plain; charset=utf-8",
  };
  return types[extension] || "application/octet-stream";
}

function securityHeaders(headers) {
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  return headers;
}

async function preview(request, env, ctx, url) {
  const rest = url.pathname.slice("/preview/".length);
  const slash = rest.indexOf("/");
  if (slash < 1) return jsonError("Project preview path is incomplete.", 404);

  let slug;
  let relativePath;
  try {
    slug = decodeURIComponent(rest.slice(0, slash));
    relativePath = rest.slice(slash + 1).split("/").map(decodeURIComponent).join("/");
  } catch {
    return jsonError("Invalid preview path.", 400);
  }

  const pathParts = relativePath.split("/");
  if (
    pathParts.length === 0 ||
    pathParts.some((part) => !part || part === "." || part === ".." || part.includes("\\"))
  ) {
    return jsonError("Invalid preview path.", 400);
  }

  const project = await env.DB.prepare(
    "SELECT repository, repo_path FROM projects WHERE slug = ?1 LIMIT 1"
  ).bind(slug).first();

  if (!project || !["Main-Portfolio", "myportfolio"].includes(project.repository)) {
    return jsonError("Project preview not found.", 404);
  }

  const sourceParts = project.repo_path.split("/").concat(pathParts);
  if (sourceParts.some((part) => !part || part === "." || part === ".." || part.includes("\\"))) {
    return jsonError("Invalid source path.", 400);
  }

  const encodedPath = sourceParts.map(encodeURIComponent).join("/");
  const upstream = "https://raw.githubusercontent.com/Rad1xx1/" +
    encodeURIComponent(project.repository) + "/main/" + encodedPath + url.search;
  const cacheKey = new Request(url.origin + url.pathname + url.search, { method: "GET" });
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const upstreamResponse = await fetch(upstream, {
    headers: { "accept": "*/*", "user-agent": "HanPortfolio/1.0" },
  });
  if (!upstreamResponse.ok) {
    return new Response("Демо-файл не найден в исходном проекте.", {
      status: upstreamResponse.status === 404 ? 404 : 502,
      headers: securityHeaders(new Headers({
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      })),
    });
  }

  const headers = securityHeaders(new Headers({
    "content-type": contentType(pathParts[pathParts.length - 1]),
    "cache-control": "public, max-age=300, s-maxage=900",
  }));
  const response = new Response(upstreamResponse.body, {
    status: 200,
    headers: headers,
  });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/health") {
        const row = await env.DB.prepare("SELECT COUNT(*) AS project_count FROM projects").first();
        return Response.json(
          { status: "ok", project_count: row.project_count },
          { headers: JSON_HEADERS }
        );
      }

      if (url.pathname === "/api/projects") {
        const result = await env.DB.prepare(
          "SELECT slug, title, category, description, repository, repo_path, source_url " +
          "FROM projects ORDER BY sort_order ASC, title ASC"
        ).all();
        return Response.json(
          { projects: result.results },
          { headers: JSON_HEADERS }
        );
      }

      if (url.pathname.startsWith("/preview/")) {
        if (request.method !== "GET") return jsonError("Method not allowed.", 405);
        return await preview(request, env, ctx, url);
      }

      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(PAGE, {
          headers: securityHeaders(new Headers({
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300",
            "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
          })),
        });
      }

      if (url.pathname === "/favicon.ico") {
        return new Response(null, { status: 204, headers: { "cache-control": "public, max-age=86400" } });
      }

      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8", "x-content-type-options": "nosniff" },
      });
    } catch (error) {
      console.error(JSON.stringify({
        message: "Portfolio request failed",
        path: url.pathname,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      return jsonError("Service temporarily unavailable.", 503);
    }
  },
};
