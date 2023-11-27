import { timeout, getPath, getImageAsAscii } from "./modules/Helpers";
import { Frontend } from "./modules/Frontend";
import { Backend } from "./modules/Backend";
import { WaveSafe } from "./modules/WaveSafe";

(async () => {
  console.log(
    await getImageAsAscii(getPath("public/idle.png"), {
      width: 28,
      height: 28,
    }),
  );

  await timeout(1000);

  const App = new WaveSafe(
    new Backend(),
    await new Frontend().initialize({
      title: "WaveSafe",
      iconPath: getPath("public/idle.png"),
      action: () => onTrayIconClick(),
      useTempDir: true,
    }),
  );

  function onTrayIconClick() {
    App.toggleActivation();
  }
})();
