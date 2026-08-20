# 🏴‍☠️ HeyFutureJasmine! — Brand & Design System Guide

**Theme:** One Piece Pirate Romance / Tides of Time Time-Capsule  
**Tagline:** *"Seal your treasure. Set it sail. Let the tides deliver it."*  

---

## 1. Brand Philosophy & Visual Identity

HeyFutureJasmine! blends the adventurous romance of Eiichiro Oda's *One Piece* with the emotional intimacy of a time capsule. 
- **Atmosphere:** Twilight voyages across the Grand Line, glowing treasure chests resting on ocean floors, weathered nautical charts, and crisp parchment letters sealed in crimson wax.
- **Tone of Voice:** Warm, earnest, whimsical, and seafaring. Interface elements feel tactile and alive — compasses spin, chests creak and glow, and wax seals melt on click.

---

## 2. Color Palette & CSS Design Tokens

The palette is tuned around a dark twilight ocean backdrop accented by radiant treasure gold, coral reds, and warm antique parchment.

### 2.1. Core Color Swatches

| Token Name | Hex Value | Role & Usage |
|---|---|---|
| `--color-ocean` | `#1e1230` | Main application background (dusk violet-navy) |
| `--color-deep-sea` | `#150c22` | Darker container panels, modal backdrops |
| `--color-grand-line` | `#3a2a4d` | Card surfaces, borders, scrollbar thumbs |
| `--color-gold` | `#f5a623` | Primary brand accent — gleaming treasure gold |
| `--color-gold-light` | `#ffc46b` | Hover states, active highlights, glowing rings |
| `--color-gold-dark` | `#c97a16` | Pressed states, active borders, compass accents |
| `--color-straw-red` | `#f0705a` | Luffy's Straw Hat coral red — CTAs, badges |
| `--color-parchment` | `#f4e8d2` | Writing & reading canvas (weathered paper) |
| `--color-parchment-dark` | `#dcc6a0` | Parchment borders, folded sheet lines |
| `--color-ink` | `#33231a` | High-contrast dark brown text on parchment |

### 2.2. Status & Delivery Tokens

| Token Name | Hex Value | Meaning |
|---|---|---|
| `--color-sealed` | `#9b7fb0` | Letter sealed & waiting for voyage |
| `--color-sailing` | `#f5a623` | Letter en route / nearing delivery date |
| `--color-delivered` | `#5bbe7e` | Washed ashore / successfully delivered |
| `--color-failed` | `#f0705a` | Delivery error / storm at sea |

### 2.3. Typography Colors

| Token Name | Hex Value | Role |
|---|---|---|
| `--color-text-primary` | `#f1e4d6` | High-emphasis headings, titles, and body copy |
| `--color-text-secondary`| `#c2a9d0` | Subtitles, helper text, and secondary stats |
| `--color-text-muted` | `#8a76a0` | Timestamps, placeholders, inactive states |

---

## 3. Typography Hierarchy

Three distinct font families create the layered pirate-manuscript aesthetic:

```html
<!-- Google Fonts Imports -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Pirata+One&display=swap" rel="stylesheet" />
```

### 3.1. Font Roles

1. **Display Font:** `"Pirata One"`, cursive
   - **Usage:** Main titles, Hero headers (`h1`, `h2`), Wanted Poster headers, Bounty numerals.
   - **Characteristics:** Expressive, tall, pirate gothic flair.
2. **Serif Reading Font:** `"Crimson Pro"`, serif
   - **Usage:** TipTap letter editor content, revealed letter body, quotes, poetic microcopy.
   - **Characteristics:** Warm, bookish, reminiscent of fountain pen ink on aged parchment.
3. **UI Sans Font:** `"DM Sans"`, sans-serif
   - **Usage:** Buttons, inputs, navigation, badges, tooltips, date pickers.
   - **Characteristics:** Clean, highly readable, contemporary geometry.

---

## 4. Reusable Surface & Component Patterns

### 4.1. The Parchment Canvas (`.parchment`)
Used for letter drafting and the opened chest reveal:
```css
.parchment {
  background:
    radial-gradient(ellipse at 20% 15%, rgba(170, 120, 30, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 85%, rgba(100, 60, 10, 0.07) 0%, transparent 55%),
    linear-gradient(180deg, var(--color-parchment) 0%, #f0e2c4 100%);
  color: var(--color-ink);
  border: 1px solid var(--color-parchment-dark);
  box-shadow: 4px 6px 20px rgba(0, 0, 0, 0.45), inset 0 0 60px rgba(160, 110, 30, 0.08);
}
```

### 4.2. The Wax Seal CTA Button (`.wax-seal`)
The signature action trigger for sealing letters:
```css
.wax-seal {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: radial-gradient(circle at 32% 30%, #ff6b6b, #c92a2a 62%);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(201, 42, 42, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.18),
    inset 0 -3px 6px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}
.wax-seal:hover {
  box-shadow: 0 10px 30px rgba(201, 42, 42, 0.55), inset 0 2px 0 rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}
```

### 4.3. Wanted Poster Profile Card (`.wanted-poster`)
Used for user profiles, bounty statistics, and partner certificates:
```css
.wanted-poster {
  background: linear-gradient(180deg, #fff6ea, #f0e1c4);
  color: var(--color-ink);
  border: 3px double #c9920a;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
}
```

---

## 5. Chest Themes & Visual Styles

HeyFutureJasmine! features 6 distinct capsule themes selectable during letter composition:

1. **Default Wood (`default`):** Weathered oak chest with brass fittings and iron trim.
2. **Treasure Gold (`gold`):** Polished 24k gold chest with glowing jewel inlays.
3. **Message in a Bottle (`scroll`):** Ancient parchment roll sealed with cork inside green sea-glass.
4. **Davy Jones Abyss (`davy_jones`):** Deep-sea barnacle-encrusted dark titanium chest.
5. **Alabasta Sun (`alabasta`):** Warm sandstone chest etched with royal desert hieroglyphs.
6. **Skypiea Celestial (`skypiea`):** Feather-light golden chest hovering with white cloud wisps.

---

## 6. Tone of Voice & Seafaring Glossary

All user-facing copy should use the pirate vernacular consistently:

| Generic UI Term | HeyFutureJasmine! Seafaring Term |
|---|---|
| "Send Letter" / "Submit" | **"Seal & Set Sail"** |
| "Save Draft" | **"Anchor in Port"** |
| "My Letters" / "Dashboard" | **"Captain's Log"** |
| "Received Letters" | **"Treasures Found"** |
| "Delete Letter" | **"Send to Davy Jones"** |
| "User Profile" | **"Wanted Poster"** |
| "Saved Contacts" | **"My Crew"** |
| "Loading..." | **"Charting the Course..."** |
| "Error Occurred" | **"Taken by the Sea..."** |
| "Empty State (No letters)" | **"Your log is empty, Captain. Set sail on your first adventure."** |
| "Letter Delivered" | **"Your treasure has washed ashore!"** |
| "Letter Sealed" | **"Your treasure is sealed and sailing the Grand Line!"** |
| "Date Picker" | **"Chart Your Destination"** |
| "Like / Upvote" | **"🔱 Trident Salute"** |

---

## 7. Motion & Micro-interactions

- **Grand Line Journey Tracker:** An animated ship icon smoothly sails from the `sentAt` coordinates to the `deliveryDate` coordinates along a dotted sea path.
- **Padlock Jiggle:** Hovering over a sealed letter card causes the padlock to jiggle playfully with a tooltip indicating days remaining.
- **Cinematic Reveal:** On opening a delivered letter, the 3D chest lid rotates backward (`rotateX(-110deg)`), accompanied by golden particle beams and audio playback.
