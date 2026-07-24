# Reel videos (001.4 — Real Estate Reel)

The reel section on the site plays the five films below. The `.mp4` files are **not**
committed here yet — export each one from Drive and drop it in this folder using
**exactly** these filenames:

| # | Filename | Orientation | Title on site | Source |
|---|----------|-------------|---------------|--------|
| 01 | `location.mp4` | horizontal | Location | [Drive](https://drive.google.com/file/d/1qfNoUIEiI0hDIhSXcpxNxnU8k_pqNO1K/view) |
| 02 | `new-area-of-work.mp4` | vertical | New Area of Work | [Drive](https://drive.google.com/file/d/1m8FSTk2tu_a1TcMg0yD3iyilBEyvKeQ5/view) |
| 03 | `ai-designed-district.mp4` | vertical | World's First AI-Designed District | [Drive](https://drive.google.com/file/d/1gCgNlPvh9SvcoKTt9u3WuGAyd_9SFeeU/view) |
| 04 | `d11-golden-place.mp4` | vertical | D11 Golden Place | [Drive](https://drive.google.com/file/d/1_Ed02ZccUHVWHW4i4KBxz9Cd3bQV8RxW/view) |
| 05 | `lifestyle.mp4` | vertical | Lifestyle | [Drive](https://drive.google.com/file/d/1WoFNT0UhQAeUjoLRjO1vdmLN9JgGvLJc/view) |

Until a file exists, its card degrades to a styled placeholder with a "Watch ↗" link to
Drive, and the reel keeps auto-advancing — so the section never looks broken.

## Orientation is auto-detected

The `horizontal` / `vertical` column above only sets the *initial* frame shape. On
`loadedmetadata` the card re-reads the file's true `videoWidth / videoHeight` and resizes
itself to match, so the frame always fits the real video — no letterboxing, no cropping,
even if a file turns out to be a different ratio than expected.

## Keep them web-sized

GitHub Pages has a ~1 GB site limit and these stream to phones on mobile data, so compress
before committing. Target a few MB each:

```bash
# vertical (9:16) — cap the long edge at 1280
ffmpeg -i raw.mp4 -vf "scale=-2:1280" -c:v libx264 -profile:v high -crf 26 \
  -preset slow -c:a aac -b:a 96k -movflags +faststart lifestyle.mp4

# horizontal (16:9) — cap the long edge at 1600
ffmpeg -i raw.mp4 -vf "scale=1600:-2" -c:v libx264 -profile:v high -crf 26 \
  -preset slow -c:a aac -b:a 96k -movflags +faststart location.mp4
```

`-movflags +faststart` matters: it moves the index to the front of the file so playback
begins before the whole video has downloaded.

Check the result before committing — anything over ~8 MB is worth another pass:

```bash
ls -lh *.mp4
```
