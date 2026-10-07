import Phaser from "phaser";
import { createPortfolioGame } from "./PortfolioGame";
import idle from "./assets/engineer-idle.svg?url&no-inline";
import walk from "./assets/engineer-walk.svg?url&no-inline";
import financeArt from './assets/npc-finance.svg?url&no-inline';
import hrArt from './assets/npc-hr.svg?url&no-inline';
import operationsArt from './assets/npc-operations.svg?url&no-inline';
import ownerArt from './assets/npc-owner.svg?url&no-inline';
import managerArt from './assets/npc-manager.svg?url&no-inline';
import { rooms, type ObjectId } from "./story";
import { canEnter, type IncidentState, type RoomId } from "./state";
export type WorldBridge = {
  room: (id: RoomId) => void;
  near: (label: string) => void;
  inspect: (id: ObjectId) => void;
  ready: () => void;
  failed: () => void;
  notice: (text: string) => void;
};
export type GameController = {
  move: (x: number, y: number) => void;
  interact: () => void;
  travel: (id: RoomId) => void;
  sync: (state: IncidentState, light: boolean, reduced: boolean) => void;
  pause: (value: boolean) => void;
  destroy: () => void;
};
export function createGame(
  host: HTMLElement,
  bridge: WorldBridge,
  initial: IncidentState,
): GameController {
  let state = initial,
    light = false,
    reduced = false,
    paused = false,
    direction = { x: 0, y: 0 };
  let scene: Office | undefined;
  let room: RoomId = "reception";
  let entry = {x:450,y:365};
  let nearLabel = "";
  const notifyNear = (value: string) => {
    if (value !== nearLabel) {
      nearLabel = value;
      bridge.near(value);
    }
  };
  class Office extends Phaser.Scene {
    player!: Phaser.GameObjects.Image;
    marker!: Phaser.GameObjects.Ellipse;
    furniture: { x: number; y: number; w: number; h: number }[] = [];
    destination: { x: number; y: number } | null = null;
    assetFailed = false;
    preload() {
      this.load.once("loaderror", () => {
        this.assetFailed = true;
        bridge.failed();
      });
      this.load.svg("engineer-idle", idle);
      this.load.svg("engineer-walk", walk);
      Object.entries({finance:financeArt,hr:hrArt,operations:operationsArt,owner:ownerArt,manager:managerArt}).forEach(([id,url])=>this.load.svg(`npc-${id}`,url));
    }
    create() {
      if (this.assetFailed) return;
      // The typed controller retains only the active scene; destroy releases it.
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      scene = this;
      this.draw();
      bridge.ready();
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (paused) return;
        // Focusing the map may blur a held direction button and stop motion.
        // Set the destination afterwards so that blur cannot cancel this tap.
        host.focus({ preventScroll: true });
        this.destination = { x: pointer.worldX, y: pointer.worldY };
      });
    }
    draw(resetPosition = false) {
      const position = !resetPosition && this.player?.active
        ? { x: this.player.x, y: this.player.y }
        : entry;
      this.children.removeAll(true);
      this.destination = null;
      this.furniture = [];
      const colors = {
        bg: light ? 0xf0f0e8 : 0x171b17,
        line: light ? 0xc7cdbe : 0x394236,
        text: light ? "#51564b" : "#bfc7b6",
        gold: light ? 0x875409 : 0xf8bd57,
        surface: light ? 0xe2e5d8 : 0x242b23,
      };
      this.cameras.main.setBackgroundColor(colors.bg);
      const g = this.add.graphics();
      g.lineStyle(1, colors.line, 0.65);
      for (let x = 36; x < 900; x += 36) g.lineBetween(x, 30, x, 510);
      for (let y = 30; y < 520; y += 36) g.lineBetween(30, y, 870, y);
      g.lineStyle(3, colors.line, 1);
      g.strokeRect(30, 50, 840, 440);
      const data = rooms.find((item) => item.id === room)!;
      this.add.text(54, 68, data.title.toUpperCase(), {
        fontFamily: "monospace",
        fontSize: "18px",
        color: colors.text,
        letterSpacing: 2,
      });
      this.add.text(54, 96, data.subtitle, {
        fontFamily: "monospace",
        fontSize: "13px",
        color: colors.text,
      });
      const index = rooms.indexOf(data);
      for (const [x, label] of [
        [42, "Previous room"],
        [858, "Next room"],
      ] as const) {
        g.fillStyle(colors.bg);
        g.fillRect(x - 16, 325, 32, 70);
        g.lineStyle(1, colors.gold);
        g.strokeRect(x - 16, 325, 32, 70);
        this.add
          .text(x, 414, label, {
            fontFamily: "monospace",
            fontSize: "12px",
            color: colors.text,
          })
          .setOrigin(0.5)
          .setRotation(x === 42 ? -Math.PI / 2 : Math.PI / 2);
      }
      if (index === 0)
        this.add
          .text(450, 445, "Follow the records. Keep the preview safe.", {
            fontFamily: "monospace",
            fontSize: "14px",
            color: colors.text,
          })
          .setOrigin(0.5);
      if (index >= 4) {
        g.lineStyle(1, colors.gold, 0.55);
        g.beginPath();
        g.moveTo(170, 430);
        g.lineTo(380, 340);
        g.lineTo(510, 280);
        g.lineTo(740, 130);
        g.moveTo(510, 280);
        g.lineTo(730, 400);
        g.moveTo(380, 340);
        g.lineTo(250, 160);
        g.strokePath();
        [
          [380, 340],
          [510, 280],
          [730, 400],
          [250, 160],
        ].forEach(([x, y]) => g.strokeCircle(x, y, 7));
      }
      if (room === "architecture") {
        if (state.solved.includes("architecture")) {
          g.lineStyle(2, colors.gold);
          g.lineBetween(235, 270, 355, 270);
          g.lineBetween(485, 270, 635, 180);
          g.lineBetween(485, 270, 635, 380);
        }
        const labels = ["HRMS", "HISTORY", "PAYROLL", "REPORTING"];
        labels.forEach((label, i) => {
          const x = [170, 420, 700, 700][i],
            y = [270, 270, 180, 380][i];
          g.fillStyle(colors.surface);
          g.fillRect(x - 65, y - 30, 130, 60);
          g.lineStyle(1, colors.gold);
          g.strokeRect(x - 65, y - 30, 130, 60);
          this.add
            .text(x, y, label, {
              fontFamily: "monospace",
              fontSize: "15px",
              color: colors.text,
            })
            .setOrigin(0.5);
        });
        this.add
          .text(450, 130, "The walls have become service boundaries.", {
            fontFamily: "monospace",
            fontSize: "14px",
            color: colors.text,
          })
          .setOrigin(0.5);
      }
      data.objects.forEach((object) => {
        if (object.npc) {
          const npc = this.add
            .image(object.x, object.y, `npc-${object.id}`)
            .setScale(1.15);
          npc.setDepth(2);
          this.furniture.push({
            x: object.x - 20,
            y: object.y - 22,
            w: 40,
            h: 44,
          });
        } else {
          g.fillStyle(colors.surface);
          g.fillRect(object.x - 58, object.y - 30, 116, 64);
          g.lineStyle(1, colors.line);
          g.strokeRect(object.x - 58, object.y - 30, 116, 64);
          g.fillStyle(colors.gold, 0.75);
          g.fillRect(object.x - 35, object.y - 18, 70, 25);
          g.lineStyle(1, colors.text === "#51564b" ? 0x51564b : 0xbfc7b6);
          g.lineBetween(
            object.x - 22,
            object.y - 9,
            object.x + 22,
            object.y - 9,
          );
          this.furniture.push({
            x: object.x - 58,
            y: object.y - 30,
            w: 116,
            h: 64,
          });
          if(object.id==='history') {
            g.fillStyle(colors.bg);g.fillRect(object.x-40,object.y-20,80,38);
            for(let row=0;row<3;row++){g.lineStyle(1,colors.gold);g.strokeRect(object.x-34,object.y-16+row*12,68,9);g.lineBetween(object.x-7,object.y-12+row*12,object.x+7,object.y-12+row*12);}
          } else if(object.id==='query') {
            g.fillStyle(colors.bg);g.fillRect(object.x-42,object.y-24,84,48);
            for(let row=0;row<4;row++){g.lineStyle(1,colors.line);g.strokeRect(object.x-36,object.y-20+row*11,72,9);g.fillStyle(colors.gold);g.fillCircle(object.x+25,object.y-16+row*11,2);}
          } else {
            g.lineStyle(1,colors.bg);for(let row=0;row<3;row++)g.lineBetween(object.x-25,object.y-12+row*6,object.x+20,object.y-12+row*6);
            g.lineStyle(2,colors.line);g.lineBetween(object.x-20,object.y+16,object.x+20,object.y+16);
          }
          if (object.id === "payroll") this.add.text(object.x, object.y + 45,
            state.fix === "rewrite" ? "EXPORT HELD" : state.fix ? "RM8,500 / REVIEWED" : "RM7,500 / MISMATCH",
            { fontFamily: "monospace", fontSize: "12px", color: colors.text }).setOrigin(0.5);
        }
        this.add
          .text(object.x, object.y - 68, object.title, {
            fontFamily: "monospace",
            fontSize: "14px",
            color: colors.text,
          })
          .setOrigin(0.5);
        this.add
          .text(object.x, object.y - 48, "INSPECT", {
            fontFamily: "monospace",
            fontSize: "11px",
            color: light ? "#875409" : "#f8bd57",
          })
          .setOrigin(0.5);
      });
      const condition =
        state.fix === "manual"
          ? "Preview reconciled / unresolved historical selector"
          : state.fix === "rewrite"
            ? "Migration underway / deadline missed"
            : state.fix === "targeted"
              ? "Resolver corrected / regression protected"
              : "Preview held / investigation in progress";
      this.add
        .text(450, 516, condition, {
          fontFamily: "monospace",
          fontSize: "12px",
          color: colors.text,
        })
        .setOrigin(0.5);
      if (room === "operations") this.add.text(450, 470,
        state.solved.includes("resilience") ? "SAME-KEY RETRY / RECONCILIATION OWNER RECORDED" : "TIMEOUT / UNKNOWN OUTCOME / DUPLICATE RISK",
        { fontFamily: "monospace", fontSize: "12px", color: colors.text }).setOrigin(0.5);
      this.marker = this.add
        .ellipse(position.x, position.y, 50, 50, colors.gold, 0.12)
        .setStrokeStyle(1, colors.gold, 0.6)
        .setDepth(2);
      this.player = this.add
        .image(position.x, position.y, "engineer-idle")
        .setScale(1.2)
        .setDepth(3);
      this.cameras.main.setBounds(0, 0, 900, 540);
      // Keep the whole room in the same 900×540 coordinate system on every
      // device. FIT scales display pixels; the camera never crops the world.
      if (state.fix === "targeted" && index >= 4) {
        g.lineStyle(2, colors.gold, 0.8);
        g.lineBetween(170, 430, 510, 280);
      }
      if (state.fix === "rewrite") {
        g.lineStyle(1, colors.gold, 0.7);
        g.strokeRect(110, 140, 680, 295);
      }
      notifyNear("");
    }
    blocked(x: number, y: number) {
      return (
        x < 48 ||
        x > 852 ||
        y < 145 ||
        y > 465 ||
        this.furniture.some(
          (r) =>
            x > r.x - 13 &&
            x < r.x + r.w + 13 &&
            y > r.y - 15 &&
            y < r.y + r.h + 15,
        )
      );
    }
    interact() {
      const data = rooms.find((item) => item.id === room)!;
      const object = data.objects.find(
        (o) => Math.hypot(o.x - this.player.x, o.y - this.player.y) < 110,
      );
      if (object) {
        this.destination = null;
        bridge.inspect(object.id);
        return;
      }
      if (this.player.x < 100 || this.player.x > 800) {
        const index = rooms.indexOf(data);
        travel(
          rooms[
            (index + (this.player.x < 100 ? -1 : 1) + rooms.length) %
              rooms.length
          ].id,
        );
        return;
      }
      bridge.notice(
        "Move near a person or terminal, then interact. Simplified navigation offers the same story through buttons.",
      );
    }
    update(time: number, delta: number) {
      if (paused || !this.player) return;
      let x = direction.x,
        y = direction.y;
      if (this.destination && !x && !y) {
        const dx = this.destination.x - this.player.x,
          dy = this.destination.y - this.player.y;
        if (Math.hypot(dx, dy) < 9) {
          this.destination = null;
          this.interact();
        } else {
          x = dx;
          y = dy;
        }
      } else if (x || y) this.destination = null;
      const length = Math.hypot(x, y);
      const distance = (170 * Math.min(delta, 40)) / 1000;
      if (length) {
        x = (x / length) * distance;
        y = (y / length) * distance;
        if (!this.blocked(this.player.x + x, this.player.y)) this.player.x += x;
        if (!this.blocked(this.player.x, this.player.y + y)) this.player.y += y;
      }
      this.player.setTexture(
        !reduced && length && Math.floor(time / 160) % 2
          ? "engineer-walk"
          : "engineer-idle",
      );
      this.marker.setPosition(this.player.x, this.player.y);
      const data = rooms.find((item) => item.id === room)!;
      const object = data.objects.find(
        (o) => Math.hypot(o.x - this.player.x, o.y - this.player.y) < 110,
      );
      notifyNear(
        object
          ? object.title
          : this.player.x < 100
            ? "Previous room"
            : this.player.x > 800
              ? "Next room"
              : "",
      );
      if (
        this.destination &&
        object &&
        Math.hypot(
          object.x - this.destination.x,
          object.y - this.destination.y,
        ) < 70
      ) {
        this.destination = null;
        this.interact();
      }
    }
  }
  function travel(id: RoomId) {
    if (id === room) return;
    if (!canEnter(id, state)) {
      bridge.notice(
        "Architecture Space opens after the integration safeguards are resolved.",
      );
      return;
    }
    const before = rooms.findIndex(item=>item.id===room);
    const after = rooms.findIndex(item=>item.id===id);
    entry = {x: after === (before+rooms.length-1)%rooms.length ? 800 : 100, y:360};
    room = id;
    direction = { x: 0, y: 0 };
    scene?.draw(true);
    bridge.room(id);
  }
  const game = createPortfolioGame({
    type: Phaser.CANVAS,
    parent: host,
    width: 900,
    height: 540,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: Office,
    audio: { noAudio: true },
    autoFocus: false,
    input: { keyboard: false },
    render: { antialias: true },
    fps: { target: 60 },
    banner: false,
  }, () => { direction = { x: 0, y: 0 }; if (scene) scene.destination = null; }, () => paused);
  const resize = new ResizeObserver(() => game.scale.refresh());
  resize.observe(host);
  return {
    move: (x, y) => {
      direction = { x, y };
      if (scene) scene.destination = null;
    },
    interact: () => scene?.interact(),
    travel,
    sync: (next, isLight, isReduced) => {
      const redraw =
        state.fix !== next.fix ||
        state.phase !== next.phase ||
        light !== isLight;
      state = next;
      light = isLight;
      reduced = isReduced;
      if (redraw && scene?.player) scene.draw();
    },
    pause: (value) => {
      paused = value;
      direction = { x: 0, y: 0 };
      if (scene) scene.destination = null;
      if (value) game.loop.sleep();
      else game.loop.wake();
    },
    destroy: () => {
      paused = true;
      scene = undefined;
      resize.disconnect();
      game.destroy(true);
      // Phaser processes destruction on its next frame. An overlay may have
      // put the loop to sleep, so wake it to release scenes/input/listeners.
      if (game.isRunning) game.loop.wake();
    },
  };
}
