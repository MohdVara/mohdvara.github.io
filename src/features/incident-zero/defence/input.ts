import { arena, emptyInput, type Input } from './simulation';
export function createInput(host: HTMLElement, onPause: () => void, onWeapon: (key: 'pulse' | 'fan' | 'switch') => void) {
    const value: Input = emptyInput(), keys = new Set<string>();
    let touch = { x: 0, y: 0 };
    const update = () => { value.x = touch.x + Number(keys.has('d') || keys.has('ArrowRight')) - Number(keys.has('a') || keys.has('ArrowLeft')); value.y = touch.y + Number(keys.has('s') || keys.has('ArrowDown')) - Number(keys.has('w') || keys.has('ArrowUp')); };
    const clear = () => { keys.clear(); touch = { x: 0, y: 0 }; Object.assign(value, emptyInput()); };
    const down = (e: KeyboardEvent) => {
        if (e.target !== host)
            return;
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            if (e.repeat && !keys.has(key)) return;
            keys.add(key);
            update();
        }
        if (['1', '2', 'q', 'e', 'Enter', 'Escape'].includes(key)) {
            e.preventDefault();
            if (e.repeat)
                return;
            if (key === 'Escape')
                onPause();
            else if (key === 'e' || key === 'Enter')
                value.interact = true;
            else
                onWeapon(key === '1' ? 'pulse' : key === '2' ? 'fan' : 'switch');
        }
    };
    const up = (e: KeyboardEvent) => { keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); update(); };
    const aim = (e: PointerEvent) => { const canvas = host.querySelector('canvas'); if (!canvas)
        return; const rect = canvas.getBoundingClientRect(); value.aim = { x: (e.clientX - rect.left) / rect.width * arena.width, y: (e.clientY - rect.top) / rect.height * arena.height }; value.assisted = false; };
    const pointerDown = (e: PointerEvent) => { if (e.button !== 0 || e.pointerType === 'touch')
        return; e.preventDefault(); host.focus({ preventScroll: true }); host.setPointerCapture(e.pointerId); aim(e); value.fire = true; };
    const pointerUp = () => { value.fire = false; };
    host.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    host.addEventListener('pointermove', aim);
    host.addEventListener('pointerdown', pointerDown);
    host.addEventListener('pointerup', pointerUp);
    host.addEventListener('pointercancel', pointerUp);
    host.addEventListener('lostpointercapture', pointerUp);
    return { value, clear, move(x: number, y: number) { touch = { x, y }; update(); }, fire(held: boolean) { value.fire = held; value.assisted = true; }, interact() { value.interact = true; }, destroy() { clear(); host.removeEventListener('keydown', down); window.removeEventListener('keyup', up); host.removeEventListener('pointermove', aim); host.removeEventListener('pointerdown', pointerDown); host.removeEventListener('pointerup', pointerUp); host.removeEventListener('pointercancel', pointerUp); host.removeEventListener('lostpointercapture', pointerUp); } };
}
export type DefenceInput = ReturnType<typeof createInput>;
