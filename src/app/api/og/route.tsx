import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Chainew";
    const subtitle = searchParams.get("subtitle") || "";
    const category = searchParams.get("category") || "";

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                    backgroundColor: "#18181b",
                    padding: "60px",
                }}
            >
                {category && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}
                    >
                        <span
                            style={{
                                backgroundColor: "#3f3f46",
                                color: "#ffffff",
                                fontSize: "20px",
                                fontWeight: 600,
                                padding: "8px 16px",
                                borderRadius: "9999px",
                            }}
                        >
                            {category}
                        </span>
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        fontSize: "60px",
                        fontWeight: 700,
                        color: "#ffffff",
                        lineHeight: 1.2,
                        marginBottom: subtitle ? "20px" : "0",
                        maxWidth: "90%",
                    }}
                >
                    {title.length > 80 ? title.substring(0, 80) + "..." : title}
                </div>

                {subtitle && (
                    <div
                        style={{
                            display: "flex",
                            fontSize: "28px",
                            color: "#a1a1aa",
                            lineHeight: 1.4,
                            maxWidth: "80%",
                        }}
                    >
                        {subtitle.length > 120
                            ? subtitle.substring(0, 120) + "..."
                            : subtitle}
                    </div>
                )}

                <div
                    style={{
                        position: "absolute",
                        top: "60px",
                        left: "60px",
                        display: "flex",
                        fontSize: "32px",
                        fontWeight: 700,
                        color: "#ffffff",
                    }}
                >
                    Chainew
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
