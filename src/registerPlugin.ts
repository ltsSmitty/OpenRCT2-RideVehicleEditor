/// <reference path="../lib/openrct2.d.ts" />

import * as Environment from "./environment";
import { main } from "./main";


registerPlugin({
	name: "TrackPaintMatcher",
	version: Environment.pluginVersion,
	authors: ["ltsSmitty"],
	type: "local",
	licence: "MIT",
	main,
});
