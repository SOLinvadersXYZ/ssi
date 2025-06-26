import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Get dynamic parameters from the request
    const title = searchParams.get("title") || "S.S.I. - SOL SPACE INVADERS"
    const description =
      searchParams.get("description") || "A retro arcade game featuring Bonk the dog defending the galaxy!"
    const score = searchParams.get("score")
    const level = searchParams.get("level")
    const achievement = searchParams.get("achievement")

    // Load fonts
    const interBold = await fetch(
      new URL(
        "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZFhjQ.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer())

    const pixelFont = await fetch(
      new URL("https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivNm4I81.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer())

    // Generate the image
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: 80,
        }}
      >
        {/* Game Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontFamily: '"Press Start 2P"',
              color: "#eab308",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            S.S.I.
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            border: "4px solid #eab308",
            borderRadius: 16,
            padding: 40,
            width: "100%",
            maxWidth: 800,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 40,
              fontFamily: '"Press Start 2P"',
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {title}
          </div>

          {/* Achievement */}
          {achievement && (
            <div
              style={{
                fontSize: 32,
                fontFamily: '"Press Start 2P"',
                color: "#eab308",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Achievement: {achievement}
            </div>
          )}

          {/* Score and Level */}
          {score && level && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 40,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontFamily: '"Press Start 2P"',
                    color: "#94a3b8",
                  }}
                >
                  SCORE
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontFamily: '"Press Start 2P"',
                    color: "#eab308",
                  }}
                >
                  {score}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontFamily: '"Press Start 2P"',
                    color: "#94a3b8",
                  }}
                >
                  LEVEL
                </div>
                <div
                  style={{
                    fontSize: 40,
                    fontFamily: '"Press Start 2P"',
                    color: "#eab308",
                  }}
                >
                  {level}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div
            style={{
              fontSize: 24,
              fontFamily: "Inter",
              fontWeight: "bold",
              color: "#94a3b8",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {description}
          </div>

          {/* Call to action */}
          <div
            style={{
              fontSize: 24,
              fontFamily: '"Press Start 2P"',
              color: "#ffffff",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            PLAY NOW
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 16,
            fontFamily: "Inter",
            color: "#94a3b8",
            marginTop: 40,
          }}
        >
          bsi-game.vercel.app
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: interBold,
            style: "normal",
            weight: 700,
          },
          {
            name: "Press Start 2P",
            data: pixelFont,
            style: "normal",
            weight: 400,
          },
        ],
      },
    )
  } catch (e) {
    console.error(e)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
