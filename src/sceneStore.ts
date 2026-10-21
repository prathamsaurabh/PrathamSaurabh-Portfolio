// Shared state between the page and the 3D scene, read every frame (no re-renders).
export const scene = {
  panStart: null as number | null, // when the welcome -> main camera pan began
  scroll: 0, // scroll position in viewport heights
};
