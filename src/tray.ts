//@ts-ignore
import Tray from 'trayicon';
console.log("imported")

export async function tray() {
	const tray = await Tray.create({
        title: "WaveSafe",
		useTempDir: true,
	});

	let main = tray.item("Power");

	main.add(tray.item("on"), tray.item("on"));
	
	let quit = tray.item("Quit", () => tray.kill());
	tray.setMenu(main, quit);
	
	console.log("done")
}