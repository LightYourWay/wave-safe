import { WaveSafe } from "./modules/WaveSafe";

(async () => {
  const App = new WaveSafe();
  await App.initialize();
})();
