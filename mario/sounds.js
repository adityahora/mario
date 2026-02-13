// =============================================
// SOUND SYSTEM - Synthesized sounds using Web Audio API
// No external files needed!
// =============================================
const SFX = (() => {
    let ctx;

    function getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function playTone(freq, duration, type = 'square', volume = 0.15, ramp = true) {
        try {
            const c = getCtx();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, c.currentTime);
            gain.gain.setValueAtTime(volume, c.currentTime);
            if (ramp) gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime);
            osc.stop(c.currentTime + duration);
        } catch (e) {}
    }

    function playNotes(notes, type = 'square', volume = 0.12) {
        try {
            const c = getCtx();
            let t = c.currentTime;
            notes.forEach(([freq, dur]) => {
                const osc = c.createOscillator();
                const gain = c.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(volume, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(t);
                osc.stop(t + dur);
                t += dur * 0.85;
            });
        } catch (e) {}
    }

    return {
        jump() {
            playTone(400, 0.08, 'square', 0.1);
            setTimeout(() => playTone(600, 0.1, 'square', 0.1), 40);
        },

        land() {
            playTone(150, 0.05, 'triangle', 0.06);
        },

        collect() {
            playNotes([
                [880, 0.08], [1100, 0.08], [1320, 0.12]
            ], 'square', 0.1);
        },

        stomp() {
            playTone(300, 0.06, 'square', 0.12);
            setTimeout(() => playTone(500, 0.1, 'square', 0.1), 50);
        },

        hurt() {
            playNotes([
                [400, 0.1], [300, 0.1], [200, 0.2]
            ], 'sawtooth', 0.12);
        },

        die() {
            playNotes([
                [500, 0.15], [400, 0.15], [300, 0.15], [200, 0.15], [100, 0.4]
            ], 'sawtooth', 0.15);
        },

        levelComplete() {
            playNotes([
                [523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.2],
                [784, 0.1], [1047, 0.35]
            ], 'square', 0.13);
        },

        gameOver() {
            playNotes([
                [400, 0.2], [380, 0.2], [360, 0.2],
                [340, 0.15], [300, 0.15], [250, 0.3], [200, 0.5]
            ], 'triangle', 0.15);
        },

        victory() {
            const c = getCtx();
            const melody = [
                [523, 0.15], [587, 0.15], [659, 0.15], [784, 0.2],
                [880, 0.15], [784, 0.15], [880, 0.15], [1047, 0.3],
                [988, 0.12], [880, 0.12], [784, 0.12], [880, 0.12], [1047, 0.4]
            ];
            playNotes(melody, 'square', 0.12);
        },

        oneUp() {
            playNotes([
                [660, 0.1], [880, 0.1], [1100, 0.15], [880, 0.1], [1100, 0.2]
            ], 'square', 0.1);
        },

        click() {
            playTone(800, 0.05, 'square', 0.08);
        },

        fall() {
            playNotes([
                [600, 0.08], [500, 0.08], [400, 0.08], [300, 0.1], [200, 0.15], [100, 0.2]
            ], 'triangle', 0.12);
        }
    };
})();
