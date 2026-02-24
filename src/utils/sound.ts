/**
 * Notification sound using Web Audio API.
 * Generates pleasant chimes without external audio files.
 */

export type NotificationSound = "chime" | "digital" | "ring" | "nature";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
}

export function playNotificationSound(type: "work" | "break", sound: NotificationSound = "chime"): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (sound) {
        case "digital":
            playDigital(ctx, now, type);
            break;
        case "ring":
            playRing(ctx, now, type);
            break;
        case "nature":
            playNature(ctx, now, type);
            break;
        case "chime":
        default:
            playChime(ctx, now, type);
            break;
    }
}

function playChime(ctx: AudioContext, now: number, type: "work" | "break") {
    const frequencies =
        type === "work"
            ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
            : [783.99, 659.25, 523.25]; // G5, E5, C5

    const noteDuration = type === "work" ? 0.15 : 0.2;

    frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, now);

        const startTime = now + i * noteDuration;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration + 0.15);
    });
}

function playDigital(ctx: AudioContext, now: number, type: "work" | "break") {
    const freq = type === "work" ? 880 : 440;
    const count = type === "work" ? 3 : 2;

    for (let i = 0; i < count; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(freq, now + i * 0.15);

        const startTime = now + i * 0.15;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + 0.08);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.1);
    }
}

function playRing(ctx: AudioContext, now: number, type: "work" | "break") {
    const freq = type === "work" ? 660 : 554.37;
    const duration = 0.5;

    const oscillator = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freq, now);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(20, now);
    lfoGain.gain.setValueAtTime(10, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    lfo.start(now);
    oscillator.start(now);
    lfo.stop(now + duration);
    oscillator.stop(now + duration);
}

function playNature(ctx: AudioContext, now: number, type: "work" | "break") {
    // Simple wood block / click sound
    const freq = type === "work" ? 1200 : 800;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.frequency.exponentialRampToValueAtTime(freq / 2, now + 0.1);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
}
