async function main() {
  const { Config } = await import("./modules/Config");
  await Config.initialize();

  const { State } = await import("./modules/State");
  await State.initialize();
  await State.configure();
}

main();
