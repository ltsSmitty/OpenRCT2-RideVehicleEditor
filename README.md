# Wet Paint – Dynamic Track Colouration for OpenRCT2

Your ride vehicles are dripping with paint, covering the tracks with paint as they roll over them!

![(Image of a ride with a purple track, with one white, one pink and one yellow train, demonstrating how the plugin works.)](https://i.imgur.com/WTBPxnR.png)

## See it in action
### Orange and blue trains permanently painting the tracks as they drive over it.
![(Video of a ride being painted orange and blue as trains go.)](https://media3.giphy.com/media/Ntsve4sZvwqGUTXidZ/giphy.gif)

### Paint in front of the train as it passes, then return the track to their original colour after it has gone by.
![(Video of an orange train painting the purple track before and behind it as it traverses the tracks.)](https://media2.giphy.com/media/wv5hoqhthLH2i3Uscp/giphy.gif)

### Mayhem? Combine train different options and colour schemes for each train set.
![(Hectic video of multiple trains colouring track in multiple ways as they go over the tracks.)](https://media2.giphy.com/media/nLUaVMamFna1B98T0x/giphy.gif)


## Current features
- Paint the tracks under a vehicle with up to three different colour themes.
- Use any combination of vehicle & track colours for each theme
- Multiple modes to control when the vehicle starts & stops painting.

## How to use it
1. Open the plugin and select a ride from the dropdown or pick one with the eyedropper, and enable colour matching.
2. Open the `Train Mode` tab to select painting & colour options.
3. Select how many colour sets to use. This is limited to by the number of trains on a ride – a ride with only one train can only have one colour set, and the maximum number of sets is 3, no matter how many trains are on the ride.
4. Select train and track colours
5. Choose when the train should start and stop painting. `Note: it's possible to selection options which override each other and produce no change.`

### FAQ
- The plugin uses the `Alternative track colour schemes` for setting the track colours, which is what limits to using only 3 different paint schemes.
- This plugin can be processor-heavy if you have multiple trains being painted at the same time. If you're running into performance issues, disable colouring for some of the rides.

###  Is it safe to uninstall the plugin if I don't want it anymore?
**Answer:** yes, uninstalling the plugin (by removing it from the Plugins folder) does not break your game or save files.


### Potential improvments
- Automatically change the 4th + more trains to automatically match the colours of the associated 1st, 2nd, and 3rd.
- Modify vehicle train colours directly inside the plugin window.
- Various performance improvements

## Installation

1. This plugin requires at least OpenRCT2 version v0.3.3 (release) or the newest develop version.
2. Download the latest version of the plugin from the [Releases page](https://github.com/ltsSmitty/Wet-Paint-Plugin).
3. To install it, put the downloaded `*.js` file into your `/OpenRCT2/plugin` folder.
    - Easiest way to find the OpenRCT2-folder is by launching the OpenRCT2 game, click and hold on the red toolbox in the main menu, and select "Open custom content folder".
    - Otherwise this folder is commonly found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin` on Windows.
    - If you already had this plugin installed before, you can safely overwrite the old file.
4. Once the file is there, it should show up ingame in the dropdown menu under the map icon.

###  Is it safe to uninstall the plugin if I don't want it anymore?
**Answer:** yes, uninstalling the plugin (by removing it from the Plugins folder) does not break your game or save files.

### Special Thanks

This plugin was inspired by a [Github discussion](https://github.com/OpenRCT2/OpenRCT2/discussions/19290) asking if this kind of painting was possible. Thanks to [particl3s](https://github.com/particl3s) for the idea.

This plugin is mostly a fork of [Basssiiie's](https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor) excellent Ride Vehicle Editor plugin, using his FlexUI framework. Many kudos to him for that work.

---

## Building the source code

This project is based on [wisnia74's Typescript modding template](https://github.com/wisnia74/openrct2-typescript-mod-template) and uses [Nodemon](https://nodemon.io/), [ESLint](https://eslint.org/) and [TypeScript](https://www.typescriptlang.org/) from this template.

1. Install latest version of [Node](https://nodejs.org/en/) and make sure to include NPM in the installation options.
2. Clone the project to a location of your choice on your PC.
3. Open command prompt, use `cd` to change your current directory to the root folder of this project and run `npm install`.
4. Find `openrct2.d.ts` TypeScript API declaration file in OpenRCT2 files and copy it to `lib` folder (this file can usually be found in `C:/Users/<YOUR NAME>/Documents/OpenRCT2/bin/` or `C:/Program Files/OpenRCT2/`).
    - Alternatively, you can make a symbolic link instead of copying the file, which will keep the file up to date whenever you install new versions of OpenRCT2.
5. Run `npm run build` (release build) or `npm run build:dev` (develop build) to build the project.
    - The default output folder is `(project directory)/dist` and can be changed in `rollup.config.prod.js` and `rollup.config.dev.js` respectively.

### Hot reload

This project supports the [OpenRCT2 hot reload feature](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) for development.

1. Make sure you've enabled it by setting `enable_hot_reloading = true` in your `/OpenRCT2/config.ini`.
2. Open `rollup.config.dev.js` and change the output file path to your plugin folder.
    - Example: `C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin/RideVehicleEditor.js`.
    - Make sure this path uses `/` instead of `\` slashes!
3. Open command prompt and use `cd` to change your current directory to the root folder of this project.
4. Run `npm start` to start the hot reload server.
5. Use the `/OpenRCT2/bin/openrct2.com` executable to [start OpenRCT2 with console](https://github.com/OpenRCT2/OpenRCT2/blob/master/distribution/scripting.md#writing-scripts) and load a save or start new game.
6. Each time you save any of the files in `./src/`, the server will compile `./src/registerPlugin.ts` and place compiled plugin file inside your local OpenRCT2 plugin directory.
7. OpenRCT2 will notice file changes and it will reload the plugin.

## Notes

Thanks to [wisnia74](https://github.com/wisnia74/openrct2-typescript-mod-template) for providing the template for this mod and readme.
