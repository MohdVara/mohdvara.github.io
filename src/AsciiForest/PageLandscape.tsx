import type { ReactNode } from "react";
import { AsciiForestBackdrop } from "./AsciiForestBackdrop";
import { pageSceneSeeds } from "./config";

type Props = {
  scene: keyof typeof pageSceneSeeds;
  aerial?: boolean;
  contained?: boolean;
  children: ReactNode;
};

export function PageLandscape({ scene, aerial = false, contained = false, children }: Props) {
  return <div className={`page-landscape ${aerial ? "page-landscape-river" : "page-landscape-forest"}${contained ? " page-landscape-contained" : ""}`} data-scene={scene}>
    <AsciiForestBackdrop aerial={aerial} seed={pageSceneSeeds[scene]} codeCanopy={!aerial} />
    <div className="page-landscape-content">{children}</div>
  </div>;
}
