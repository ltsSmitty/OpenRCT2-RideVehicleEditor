/// <reference path="../lib/openrct2.d.ts" />

import * as Environment from "./environment";
import { main } from "./main";


registerPlugin({
	name: Environment.pluginName,
	version: Environment.pluginVersion,
	authors: ["ltsSmitty"],
	type: "local",
	licence: "MIT",
	// targetApiVersion: 69,
	main,
});
