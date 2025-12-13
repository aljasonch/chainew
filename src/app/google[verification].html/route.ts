import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { verification: string } },
) {
  const token = params.verification;
  const body = `google-site-verification: google${token}.html`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}