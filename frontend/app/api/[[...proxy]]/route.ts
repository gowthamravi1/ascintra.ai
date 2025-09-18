import { NextRequest } from "next/server";

const target = process.env.BACKEND_URL || "http://localhost:8000";

async function forward(req: NextRequest, path: string, method: string) {
  const search = req.nextUrl.search ? req.nextUrl.search : "";
  const url = `${target}/api/${path}${search}`.replace(/\/+$/, "");

  const headers: Record<string, string> = {};
  // Forward JSON content-type if present
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  const init: RequestInit = { method, headers, redirect: "manual" };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const body = await req.text();
    init.body = body;
  }

  const res = await fetch(url, init as any);
  const text = await res.text();
  const respHeaders = new Headers();
  const resCT = res.headers.get("content-type");
  if (resCT) respHeaders.set("content-type", resCT);
  // CORS not needed for same-origin proxy
  return new Response(text, { status: res.status, headers: respHeaders });
}

export async function GET(req: NextRequest, ctx: { params?: { proxy?: string[] } }) {
  const p = ctx?.params?.proxy ?? [];
  return forward(req, p.join("/"), "GET");
}

export async function POST(req: NextRequest, ctx: { params?: { proxy?: string[] } }) {
  const p = ctx?.params?.proxy ?? [];
  return forward(req, p.join("/"), "POST");
}

export async function PUT(req: NextRequest, ctx: { params?: { proxy?: string[] } }) {
  const p = ctx?.params?.proxy ?? [];
  return forward(req, p.join("/"), "PUT");
}

export async function PATCH(req: NextRequest, ctx: { params?: { proxy?: string[] } }) {
  const p = ctx?.params?.proxy ?? [];
  return forward(req, p.join("/"), "PATCH");
}

export async function DELETE(req: NextRequest, ctx: { params?: { proxy?: string[] } }) {
  const p = ctx?.params?.proxy ?? [];
  return forward(req, p.join("/"), "DELETE");
}
