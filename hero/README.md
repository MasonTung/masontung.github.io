# Hero Images

Drop the hero background photo here.

## Expected files
- `hero-bg.jpg` (or `.webp`) — main background photo for the home page hero
  - Recommended: landscape, 2400×1600 or larger, will be cropped to viewport
  - Will get a peach/orange tint overlay applied via CSS

The hero references:
```html
<img class="hero-bg-img" src="hero/hero-bg.jpg" alt="" />
```

If absent, CSS falls back to a peach gradient.
