ReferenceError: drawTitleScreen is not defined
    at BonkShooter.useEffect.animate (webpack-internal:///(app-pages-browser)/./bonk-shooter.tsx:289:25)
    at BonkShooter.useEffect (webpack-internal:///(app-pages-browser)/./bonk-shooter.tsx:304:13)
    at GamePage (webpack-internal:///(app-pages-browser)/./app/game/page.tsx:141:87)
    at ClientPageRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/client-page.js:20:50)

    Console Error


Error: Failed to load because no supported source was found.

 ▲ Next.js 15.2.4
   - Local:        http://localhost:3000
   - Network:      http://192.168.52.12:3000
   - Environments: .env

 ✓ Starting...
 ✓ Ready in 2.8s
 ○ Compiling / ...
 ✓ Compiled / in 15.8s (8723 modules)
(node:27576) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 GET / 200 in 17682ms
 ✓ Compiled in 2.3s (4197 modules)
 HEAD / 200 in 50ms
 ✓ Compiled /middleware in 300ms (101 modules)
 ○ Compiling /game ...
 ⨯ ./bonk-shooter.tsx
Error:   × Expression expected
      ╭─[C:\Users\PC\Documents\0CODER\bsi\bonk-shooter.tsx:1324:1]
 1321 │       cancelAnimationFrame(animationId)
 1322 │       window.removeEventListener("keydown", handleKeyDown)
 1323 │     }
 1324 │   }, [currentGameState])
      ·    ─
 1325 │
 1326 │   // Handle start game
 1327 │   const startGame = () => {
      ╰────

Caused by:
    Syntax Error

Import trace for requested module:
./bonk-shooter.tsx
./app/game/page.tsx
 ⨯ ./bonk-shooter.tsx
Error:   × Expression expected
      ╭─[C:\Users\PC\Documents\0CODER\bsi\bonk-shooter.tsx:1324:1]
 1321 │       cancelAnimationFrame(animationId)
 1322 │       window.removeEventListener("keydown", handleKeyDown)
 1323 │     }
 1324 │   }, [currentGameState])
      ·    ─
 1325 │
 1326 │   // Handle start game
 1327 │   const startGame = () => {
      ╰────

Caused by:
    Syntax Error

Import trace for requested module:
./bonk-shooter.tsx
./app/game/page.tsx
 ⨯ ./bonk-shooter.tsx
Error:   × Expression expected
      ╭─[C:\Users\PC\Documents\0CODER\bsi\bonk-shooter.tsx:1324:1]
 1321 │       cancelAnimationFrame(animationId)
 1322 │       window.removeEventListener("keydown", handleKeyDown)
 1323 │     }
 1324 │   }, [currentGameState])
      ·    ─
 1325 │
 1326 │   // Handle start game
 1327 │   const startGame = () => {
      ╰────

Caused by:
    Syntax Error

Import trace for requested module:
./bonk-shooter.tsx
./app/game/page.tsx
 GET /game 500 in 14464ms
 GET /game 500 in 24ms
 GET /game 500 in 25ms
 GET /game 500 in 32ms