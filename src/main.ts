console.log("test")
// @ts-ignore
import Tray from 'trayicon';

(async () => {

	console.log("imported")
	const tray = await Tray.create({
		useTempDir: true,
	});
	let main = tray.item("Power");
	main.add(tray.item("on"), tray.item("on"));
	
	let quit = tray.item("Quit", () => tray.kill());
	tray.setMenu(main, quit);
	
	console.log("done")
})()