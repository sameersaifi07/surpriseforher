# 🎁 Birthday Surprise Website

An interactive, mobile-first birthday surprise website. The person you love opens it on their phone and taps through a story made just for them, with music, fireworks and gifts.

No coding needed: you change **one settings block** at the top of `index.html`.

---

## ✨ What's inside

| Chapter | What happens |
|---|---|
| 🔒 Countdown + PIN | Optional lock until midnight, then a secret PIN (real encryption available) |
| ❤️ Tap to begin | Your song starts on the first tap |
| 🎁 3D gift box | Shakes, the lid flies off, light rays and hearts burst out |
| 🎆 Happy Birthday | Name animation, tap-the-sky fireworks, a firework show, rose shower |
| ⏳ Time together | Live counter: days, hours, minutes, seconds |
| 📖 Our story | Relationship timeline |
| 🎂 Make a wish | Chocolate cake, tap the candle (or blow into the mic) and read your wish |
| 🎈 Pop the balloons | Glossy balloons that pop into glowing messages |
| 🌹 Rose garden | Tap to plant roses |
| ❓ Quiz | "Do you remember?" with cute right/wrong answers |
| 💌 Reasons I love you | Flip cards |
| 🎁 Memory boxes | Gift boxes that open into swipeable photo and video cards |
| 🕐 Birthday plan | The whole day, hour by hour, unwrapped one by one |
| 🎟️ Love coupons | Redeemable forever |
| ✨ Tomorrow is yours | They pick wishes for tomorrow and send them to you |
| ✉️ Open when… | Letters for later |
| 📝 The letter | A handwritten-style letter |
| 🪄 Scratch card | Scratch to reveal |
| 💍 Last question | The "No" button runs away |
| 🚪 The door | Doorbell rings, the door opens, the final surprise appears (time your real gift delivery!) |
| 🎙️ Voice note | Optional voice message player at the very end |

Also: hidden moon secret 🌙, sparkle trail, falling petals, settings (music on/off, volume, effects), works offline-friendly, respects reduced-motion.

---

## ✏️ 1. Personalise it (5–15 minutes)

Open `index.html` in any text editor (Notepad, VS Code) and edit the **`CONFIG`** block at the very top. Every line has a comment explaining it.

The most important ones:

```js
herName:  "Your Love",       // the birthday person's name
nickName: "Sweetheart",      // what you call them
fromName: "Your Name",       // your name
age: 25,                     // or null to hide
togetherSince: "2024-02-14T19:00:00",
birthday: "2026-12-01T00:00:00",   // countdown until this moment ("" = none)
```

**Rules:** keep the quotes `"..."` and the commas. Text inside `` `...` `` (backticks) can span several lines.

Want to hide a chapter? Empty its list, e.g. `wishes: []` or `quiz: []`.

---

## 🖼️ 2. Add photos, videos and music

1. Put your files in the **`media`** folder: photos (`.jpg`, `.png`), videos (`.mp4`), music (`.mp3`).
2. In `CONFIG → albums`, point each item to your file:
   ```js
   { src: "media/our-first-date.jpg", caption: "The day everything changed." }
   ```
3. Music: `music: "media/song.mp3"`. Use music you have the right to use.
4. Delete the `sample-*.svg` placeholders when you're done.

**Voice note (optional):** save a recording as `media/voice-note.mp3`. The player appears at the end automatically.

---

## 👀 3. Preview it

Open `index.html` in Chrome or Safari, or better, run a tiny local server so music and videos load reliably:

```bash
npx serve .
```

Add **`?preview`** or **`#preview`** to the address to skip the countdown and PIN while testing.

---

## 🚀 4. Put it online (free)

**GitHub Pages**
1. Create a repository and upload the files (`index.html`, `media/`, …).
2. Go to Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Your link: `https://YOUR-USERNAME.github.io/REPO-NAME/`

**Netlify Drop:** drag the folder onto <https://app.netlify.com/drop>.

> ⚠️ A public repository is visible to everyone. For a real surprise with private photos, use the PIN lock below, or a private host.

---

## 🔒 5. Lock with a PIN (real encryption)

The simple `secretCode` setting only shows a PIN screen. To truly protect your photos, videos and texts, encrypt the site:

1. Install Node.js from <https://nodejs.org>.
2. In this folder, run:
   ```bash
   node tools/lock.js 482916 2026-12-01T00:00:00
   ```
   (your PIN, then the optional unlock date)
3. Upload **only the two files in `dist/`** (`index.html` + `bundle.enc`) to your hosting.

Without the PIN, everything stays encrypted (AES-256): no photos, names or text can be read, even from the code. Before the countdown ends, tap the 🔒 icon 5 times to enter the PIN early (handy for testing).

**Tip:** use a 6–8 digit PIN. 4 digits are easy to type but easier to guess.

---

## 💡 Tips for the perfect surprise

- Send the link before midnight. The countdown opens it automatically at 12:00 AM.
- Send the PIN at 11:59 PM.
- Time your real gift delivery to arrive when they reach **The door** chapter.
- Test everything on your phone first, with sound on.

---

## ❓ Troubleshooting

| Problem | Fix |
|---|---|
| No music | Check the `music` path and that the file is in `media/`. Browsers start sound only after the first tap; that's what the heart is for. |
| Photo doesn't show | Check the file name in `albums` (it's case-sensitive). |
| Site is blank after editing | A quote or comma is missing in `CONFIG`. Undo your last change. |
| Mic blowing doesn't work | It needs an `https` link (GitHub Pages and Netlify are https). Tapping the candle always works. |
