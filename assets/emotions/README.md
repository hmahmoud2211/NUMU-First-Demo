# Emotion images (FER2013)

NUMU's emotion exercises use example faces from the
[FER2013 dataset](https://www.kaggle.com/datasets/msambare/fer2013).
The dataset is **not** bundled with this repo — download it from Kaggle and copy a
small, hand-picked selection into the folders below.

```
assets/emotions/
  happy/
  sad/
  angry/
  fear/
  surprise/
  disgust/
  neutral/
```

The Kaggle archive already uses these folder names (`train/happy`, `test/fear`, …),
so you can copy files straight across.

## Adding images

1. Copy `.jpg` / `.png` files into the matching emotion folder, e.g.
   `assets/emotions/fear/Training_10118481.jpg`.
2. (Optional) Set a difficulty by prefixing the file name with `d1_`, `d2_` or `d3_`
   (e.g. `d3_Training_10118481.jpg` for a subtle expression). The default is 1.
3. Regenerate the manifest:

   ```bash
   npm run emotions:manifest              # up to 12 images per emotion
   npm run emotions:manifest -- --max 30  # more images per emotion
   ```

   This rewrites `src/data/emotionImageManifest.ts` with static `require()` calls.
4. Restart Metro (`npx expo start --clear`).

## How the app uses them

- All image metadata is centralised in `src/data/emotions.ts`. Screens never list images.
- `getImagesForEmotion(emotion)` returns FER2013 photos when an emotion has any, and
  falls back to built-in **illustrated faces** when it has none — so the demo works
  before any photos are added, and you can add emotions one at a time.
- Every game depends on the `EmotionImage` type, so photos could later come from an
  API, another dataset, or generated illustrations without changing any screen.
- If a photo fails to load, `EmotionImage` shows an illustration instead.

## Choosing images

FER2013 images are 48×48 grayscale and some labels are noisy. For a child-facing demo,
pick clear, unambiguous examples, and avoid images that may be distressing.
Keep the per-emotion count small (10–30) to keep the app bundle light.
