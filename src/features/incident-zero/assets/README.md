# Artwork slots

V1 intentionally uses original vector art and programmatic room geometry, as requested. Art is synthetic, unbranded and has no employer/customer references. Collision and evidence logic live outside these files.

| Slot | Recommended replacement | Dimensions / integration |
| --- | --- | --- |
| Engineer idle | `engineer-idle.svg` (existing) or transparent PNG | Current 32×48 canvas; keep centred origin and feet at y=43. A 96×144 PNG may replace it at equivalent display size. |
| Engineer walk | `engineer-walk.svg` (existing) or sprite sheet | Same framing. Future 4-frame 384×144 PNG, 96×144 per frame; register frames in the Phaser preload/animation boundary. |
| NPC variants | `npc-finance.png`, `npc-hr.png`, `npc-operations.png`, `npc-owner.png`, `npc-lead.png` | Optional 96×144 transparent figures; adapt room object rendering, preserve collision and interaction radii. Current NPCs use five distinct original SVG variants with individual clothing, hair and accessories. |
| Room art | `room-reception.png`, `room-finance.png`, `room-hr.png`, `room-operations.png`, `room-server.png` | Optional 1800×1080 art mapped to the current 900×540 world. Keep side doors at x=42/858, y=360; do not bake dialogue or live system state into the image. |
| Abstract system space | `room-architecture.png` | Same 1800×1080 world framing; organic branching, service boundaries, warm gold. Network labels and chosen connections remain SVG/canvas UI. |
| Optional chapter panels | `chapter-history.webp`, `chapter-integration.webp` | 1600×900, no embedded UI text. They can accompany a short, skippable transition; not needed for current playability. |
| Optional ending cards | `ending-firefighter.webp`, `ending-rewrite.webp`, `ending-modernizer.webp` | 1200×675. Outcome, score, caveats and portfolio controls remain HTML. |
| Optional social/promo artwork | `incident-zero-social.png` / later promo video | 1200×630 social image; video must be opt-in and independently lazy-loaded. The current route uses the portfolio's existing social image. |

Keep near-black/warm off-white, restrained neutral figures, thin boundaries and gold active paths. Avoid neon, fantasy props, cultural motifs and real payroll/company imagery. AI-generated assets can be created later; there is no generative service in gameplay. Preserve the complete structured navigation mode and reduced-motion behaviour when replacing art.
