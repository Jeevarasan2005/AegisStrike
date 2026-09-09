import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { vulnerability_type, is_secure, payload } = body;
  const payloadClean = (payload || "").trim();

  if (vulnerability_type === "sqli") {
    const sqliPatterns = [
      /'\s*or\s*['"]?\d+['"]?\s*=\s*['"]?\d+/i,
      /'\s*or\s*['"].+['\"]\s*=\s*['"].+/i,
      /union\s+select/i,
      /'\s*--/i,
      /'\s*#/i
    ];
    const isSqli = sqliPatterns.some(p => p.test(payloadClean));

    if (!is_secure) {
      const query = `SELECT * FROM users WHERE username = '${payload}'`;
      if (isSqli) {
        return NextResponse.json({
          status: "vulnerable",
          message: "SQL Injection successful! Bypassed authentication and returned all user records.",
          simulated_query: query
        });
      }
      return NextResponse.json({
        status: "executed",
        message: "Query executed, but no SQL injection payload triggered. Access denied (user not found).",
        simulated_query: query
      });
    } else {
      return NextResponse.json({
        status: "secure",
        message: "Query executed safely. The database treated your input purely as text, preventing any SQL Injection.",
        simulated_query: "SELECT * FROM users WHERE username = %s",
        parameters: [payload]
      });
    }
  }

  if (vulnerability_type === "xss") {
    const xssPatterns = [/<script.*?>/i, /javascript:/i, /on\w+\s*=/i, /<img.*?>/i];
    const isXss = xssPatterns.some(p => p.test(payloadClean));

    if (!is_secure) {
      if (isXss) {
        return NextResponse.json({
          status: "vulnerable",
          message: "Reflected XSS successful! Your script executed in the browser context.",
          rendered_html: `<div>Hello ${payload}</div>`
        });
      }
      return NextResponse.json({
        status: "executed",
        message: "Input rendered. Since there was no script or HTML payload, no XSS triggered.",
        rendered_html: `<div>Hello ${payload}</div>`
      });
    } else {
      const safePayload = payloadClean.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return NextResponse.json({
        status: "secure",
        message: "Input was properly sanitized. HTML characters were encoded safely.",
        rendered_html: `<div>Hello ${safePayload}</div>`
      });
    }
  }

  if (vulnerability_type === "path_traversal") {
    const isTraversal = payloadClean.includes("../") || payloadClean.includes("..\\");

    if (!is_secure) {
      if (isTraversal) {
        return NextResponse.json({
          status: "vulnerable",
          message: "Path Traversal successful! Bypassed directory boundary and accessed sensitive file: /etc/passwd",
          simulated_path: `/var/www/html/images/${payload}`
        });
      }
      return NextResponse.json({
        status: "executed",
        message: "File accessed within the directory.",
        simulated_path: `/var/www/html/images/${payload}`
      });
    } else {
      return NextResponse.json({
        status: "secure",
        message: "Path traversal blocked! The code validated that the resolved path stays within the base directory.",
        simulated_path: `/var/www/html/images/${payload.replace(/\.\.\//g, "")}`
      });
    }
  }

  return NextResponse.json({ detail: "Unknown vulnerability type" }, { status: 400 });
}
