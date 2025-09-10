1:41:35 PM: Netlify Build                                                 
11:41:35 PM: ────────────────────────────────────────────────────────────────
11:41:35 PM: ​
11:41:35 PM: ❯ Version
11:41:35 PM:   @netlify/build 35.1.6
11:41:35 PM: ​
11:41:35 PM: ❯ Flags
11:41:35 PM:   accountId: 689f151e11d15803aea14f9d
11:41:35 PM:   baseRelDir: true
11:41:35 PM:   buildId: 68c1d45c3987020008d48107
11:41:35 PM:   deployId: 68c1d45c3987020008d48109
11:41:35 PM: ​
11:41:35 PM: ❯ Current directory
11:41:35 PM:   /opt/build/repo
11:41:35 PM: ​
11:41:35 PM: ❯ Config file
11:41:35 PM:   /opt/build/repo/netlify.toml
11:41:35 PM: ​
11:41:35 PM: ❯ Context
11:41:35 PM:   production
11:41:35 PM: ​
11:41:35 PM: ❯ Using Next.js Runtime - v5.13.1
11:41:36 PM: No Next.js cache to restore
11:41:36 PM: ​
11:41:36 PM: build.command from netlify.toml                               
11:41:36 PM: ────────────────────────────────────────────────────────────────
11:41:36 PM: ​
11:41:36 PM: $ npm run build
11:41:36 PM: > mmorpg-web-game@0.1.0 build
11:41:36 PM: > next build
11:41:36 PM: ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
11:41:37 PM:    ▲ Next.js 14.0.4
11:41:37 PM:    Creating an optimized production build ...
11:41:42 PM:  ✓ Compiled successfully
11:41:42 PM:    Linting and checking validity of types ...
11:41:45 PM: Failed to compile.
11:41:45 PM: 
11:41:45 PM: ./components/Game/UI/DatabaseInventoryPanel.tsx:88:15
11:41:45 PM: Type error: Object literal may only specify known properties, and 'durability' does not exist in type 'GameItem'.
11:41:45 PM:   86 |               stackable: inventoryItem.item.stackable,
11:41:45 PM:   87 |               stackSize: inventoryItem.stack_size,
11:41:45 PM: > 88 |               durability: inventoryItem.item.durability,
11:41:45 PM:      |               ^
11:41:45 PM:   89 |               setBonus: inventoryItem.item.setBonus,
11:41:45 PM:   90 |               requirements: inventoryItem.item.requirements,
11:41:45 PM:   91 |               equipment_slot: inventoryItem.item.equipment_slot || null,
11:41:45 PM: ​
11:41:45 PM: "build.command" failed                                        
11:41:45 PM: ────────────────────────────────────────────────────────────────
11:41:45 PM: ​
11:41:45 PM:   Error message
11:41:45 PM:   Command failed with exit code 1: npm run build (https://ntl.fyi/exit-code-1)
11:41:45 PM: ​
11:41:45 PM:   Error location
11:41:45 PM:   In build.command from netlify.toml:
11:41:45 PM:   npm run build
11:41:45 PM: ​
11:41:45 PM:   Resolved config
11:41:45 PM:   build:
11:41:45 PM:     command: npm run build
11:41:45 PM:     commandOrigin: config
11:41:45 PM:     environment:
11:41:45 PM:       - NEXT_PUBLIC_SUPABASE_ANON_KEY
11:41:45 PM:       - NEXT_PUBLIC_SUPABASE_URL
11:41:45 PM:       - NODE_VERSION
11:41:45 PM:       - NPM_VERSION
11:41:45 PM:     publish: /opt/build/repo/out
11:41:45 PM:     publishOrigin: config
11:41:45 PM:   plugins:
11:41:45 PM:     - inputs: {}
11:41:45 PM:       origin: ui
11:41:45 PM:       package: "@netlify/plugin-nextjs"
11:41:45 PM:   redirects:
11:41:46 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)
11:41:46 PM:     - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
11:41:46 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
11:41:46 PM: Failing build: Failed to build site
11:41:46 PM: Finished processing build request in 27.127s