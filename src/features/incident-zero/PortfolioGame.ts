import Phaser from 'phaser';

// Phaser 3.90's default visibility handler retains a document listener after
// destruction and overwrites window.onblur/onfocus. Preserve its start lifecycle
// while owning subscriptions. Shared by the story and optional arcade renderer.
export function createPortfolioGame(
  config: Phaser.Types.Core.GameConfig,
  stopInputs: () => void,
  shouldSleep: () => boolean,
): Phaser.Game {
  class PortfolioGame extends Phaser.Game {
    declare isRunning: boolean;
    protected start() {
      this.isRunning = true;
      this.config.postBoot(this);
      this.loop.start(this.renderer ? this.step.bind(this) : this.headlessStep.bind(this));
      const events = Phaser.Core.Events;
      this.events.on(events.HIDDEN, this.onHidden, this);
      this.events.on(events.VISIBLE, this.onVisible, this);
      this.events.on(events.BLUR, this.onBlur, this);
      this.events.on(events.FOCUS, this.onFocus, this);
      const visibility = () => {
        if (document.hidden) stopInputs();
        this.events.emit(document.hidden ? events.HIDDEN : events.VISIBLE);
        if (shouldSleep()) this.loop.sleep();
      };
      const blur = () => { stopInputs(); this.events.emit(events.BLUR); };
      const focus = () => this.events.emit(events.FOCUS);
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('blur', blur);
      window.addEventListener('focus', focus);
      this.events.once(events.DESTROY, () => {
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('blur', blur);
        window.removeEventListener('focus', focus);
      });
    }
  }
  return new PortfolioGame(config);
}
