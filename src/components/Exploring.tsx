import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Place = {
  name: string;
  where: string;
  when: string;
  text: string;
  photos: { src: string; alt: string }[];
};

const img = (name: string) => `/exploring/${name}.jpg`;

// Newest first. Photos live in public/exploring.
const places: Place[] = [
  {
    name: 'Quandary Peak',
    where: 'Breckenridge, Colorado',
    when: 'Aug 2026',
    text: 'One of Colorado’s 14,000-foot peaks, with a long, rocky ridge that climbs well above treeline. Mountain goats wander right along the trail near the top.',
    photos: [
      { src: img('quandary-3'), alt: 'Open alpine slope looking out over distant ranges' },
      { src: img('quandary-2'), alt: 'Mountain goat on the rocky ridge trail' },
      { src: img('quandary-1'), alt: 'Rocky trail on the ridge under a deep blue sky' },
    ],
  },
  {
    name: 'Rocky Mountain National Park',
    where: 'Estes Park, Colorado',
    when: 'Aug 2026',
    text: 'Quiet lakes tucked into the pines, then a drive up to alpine tundra at nearly 12,000 feet. Afternoon storm clouds rolled in fast over the peaks.',
    photos: [
      { src: img('rocky-mountains-1'), alt: 'Small lake framed by pines with a peak behind it' },
      { src: img('rocky-mountains-2'), alt: 'Valley view from a mountain road under puffy clouds' },
      { src: img('rocky-mountains-4'), alt: 'Alpine tundra and jagged peaks under storm clouds' },
    ],
  },
  {
    name: 'Lake Louise & Moraine Lake',
    where: 'Banff National Park, Alberta',
    when: 'Jul 2026',
    text: 'Two glacier-fed lakes a short drive apart, both an unreal shade of turquoise. The color comes from fine rock flour ground down by the glaciers above.',
    photos: [
      { src: img('lake-louise-1'), alt: 'Turquoise Lake Louise with a glacier at the far end' },
      { src: img('lake-moraine-1'), alt: 'Moraine Lake beneath the Valley of the Ten Peaks' },
    ],
  },
  {
    name: 'Sulphur Mountain',
    where: 'Banff, Alberta',
    when: 'Jul 2026',
    text: 'An evening up on the ridge above Banff, looking out over the Bow Valley as haze softened the peaks. A herd of bighorn sheep strolled right past us.',
    photos: [
      { src: img('sulphur-1'), alt: 'Hazy peak seen from the Sulphur Mountain lookout' },
      { src: img('sulphur-2'), alt: 'Bighorn sheep walking along the ridge' },
    ],
  },
  {
    name: 'Skyline Loop',
    where: 'Mount Rainier National Park, Washington',
    when: 'Jul 2026',
    text: 'A loop from Paradise that climbs through meadows to views right up against Rainier’s glaciers. Myrtle Falls sits along the trail on the way.',
    photos: [
      { src: img('skyline-1'), alt: 'Snow-covered Mount Rainier up close' },
      { src: img('skyline-2'), alt: 'Tatoosh Range and snowfields from high on the trail' },
      { src: img('skyline-3'), alt: 'Myrtle Falls with Mount Rainier behind it' },
    ],
  },
  {
    name: 'Pinnacle Peak',
    where: 'Mount Rainier National Park, Washington',
    when: 'Jun 2026',
    text: 'A short, steep climb into the Tatoosh Range with snow still hanging on in June. From the saddle you can see all the way south to Mount Adams.',
    photos: [
      { src: img('pinnacle-1'), alt: 'Snowy ridge in the Tatoosh Range under a bright sun' },
      { src: img('pinnacle-2'), alt: 'Long valley view with Mount Adams on the horizon' },
      { src: img('pinnacle-3'), alt: 'Craggy rock face of Pinnacle Peak' },
    ],
  },
  {
    name: 'Annette Lake',
    where: 'Snoqualmie Pass, Washington',
    when: 'May 2026',
    text: 'A forested climb off I-90 that ends at a clear green lake under steep, rocky cliffs. The water was so clear you could see every stone on the bottom.',
    photos: [
      { src: img('annette-2'), alt: 'Clear green Annette Lake below a rocky peak' },
      { src: img('annette-1'), alt: 'Talus slope and forest leading up to the lake basin' },
      { src: img('annette-3'), alt: 'Still reflection of the forested ridge on the lake' },
    ],
  },
  {
    name: 'Kīlauea',
    where: 'Hawaiʻi Volcanoes National Park, Hawaiʻi',
    when: 'Dec 2025',
    text: 'Lava fountains lit up the crater in the middle of the night, glowing orange through the volcanic haze. Across the island, old black lava fields run all the way to the Kona coast.',
    photos: [
      { src: img('kilauea-1'), alt: 'Lava fountain glowing in the crater at night, seen from the rim' },
      { src: img('kilauea-2'), alt: 'Close view of erupting lava lighting up the haze' },
      { src: img('kilauea-3'), alt: 'Black lava field under grey clouds on the Kona coast' },
    ],
  },
];

export default function Exploring() {
  const [open, setOpen] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    document.body.classList.add('locked'); // stop the page scrolling behind the photo
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('locked');
    };
  }, [open]);

  return (
    <section className="exploring-page">
      <h2 className="label">Exploring</h2>
      <p className="exploring-intro">Trails, peaks and lakes from time spent outside, mostly in the Cascades and the Rockies.</p>
      <div className="places">
        {places.map((p) => (
          <article className="place reveal" key={p.name}>
            <header className="place-info">
              <p className="place-meta">
                {p.where} · {p.when}
              </p>
              <h4>{p.name}</h4>
              <p className="place-text">{p.text}</p>
            </header>
            <div className={`place-photos n${p.photos.length}`}>
              {p.photos.map((ph) => (
                <button type="button" key={ph.src} onClick={() => setOpen(ph)} aria-label={`View photo: ${ph.alt}`}>
                  <img src={ph.src} alt={ph.alt} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Rendered on <body> so it sits above the nav bar */}
      {open &&
        createPortal(
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.alt} onClick={() => setOpen(null)}>
            <img src={open.src} alt={open.alt} />
            <button type="button" className="lightbox-close" aria-label="Close">×</button>
          </div>,
          document.body,
        )}
    </section>
  );
}
