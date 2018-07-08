import * as React from 'react';
import * as C from './components';

const e = React.createElement;

export const sections = [
	{
		key: 'what',
		title: 'What is this?',
		body: e(C.Markdown, {
			source: `
[vsynth](http://david-lee.net/vsynth) is a modular video synthesizer for the web browser. You can use it to program unique visual effects.
		`}),
	},
	{
		key: 'how',
		title: 'How do I use it?',
		body: e('div', {},
			e(C.Markdown, {
				source: `
Great question. Here's a 5 minute screencast which will walk you through creating a simple patch.
				`
			}),
			e(C.VideoAspectRatio,
				{},
				e(C.VideoPlayer, {
					url: "https://player.vimeo.com/video/278616817",
					width: "100%",
					height: "100%",
				})))
	},
	{
		key: 'feedback',
		title: "Something's not working!",
		body: e(C.Markdown, {
				source: `
If you encounter a bug, or if you want to request a feature, or if you just want to say hi, please drop a line on [this Google Form](https://docs.google.com/forms/d/e/1FAIpQLSdKup212FRe47iflRs-N7RBwRC3F1EYBm3ocN7Skf6LNB6BJw/viewform?usp=sf_link).

If you'd like to help me out, [here is the Github repo for vsynth](https://github.com/davidisaaclee/vsynth).
				`
			})
	},
	{
		key: 'save-load',
		title: "How do I share my patches?",
		body: e(C.Markdown, {
				source: `
You can save your patches as a \`.vsynth\` file to send to your loved ones.

_To save a file..._

1. Click on the \`File\` button in the lower right corner of the patching screen.
2. Click on the \`Save to computer\` button.
3. Check your downloads folder for a file named \`patch.vsynth\`. This is your patch file. (You can rename it to anything you'd like, as long as it ends with \`.vsynth\`.)

_To load a file..._

1. Click on the \`File\` button in the lower right corner of the screen.
2. Click on the \`Load from file\` button.
3. Choose your \`.vsynth\` file in the file picker window.
				`
			})
	},
	{
		key: 'pro-tips',
		title: "Any protips?",
		body: e(C.Markdown, {
				source: `
- __Your progress is saved when you navigate away from vsynth.__ Feel free to leave and come back later.
- __iOS users: Add vsynth to your homescreen to enable fullscreen play.__ After opening vsynth in Safari, tap the share icon in the middle of the toolbar at the bottom of the screen. Scroll through the grey icons, and tap on the action labeled \`Add to Home Screen\`.
- __To make fine adjustments to a slider, first drag down on the slider, then move the cursor left or right.__ As you increase the vertical distance between your cursor and the slider, your adjustments will become more precise.
- __Mac users: Use QuickTime Player to capture your video patches.__ You can record a portion of the screen using QuickTime Player, which comes installed on all Macs. Find QuickTime Player on your computer; open it; and click on \`File > New Screen Recording\` to begin recording your patch.
- __iOS users: Use screen recording to capture your video patches.__ Follow [these instructions](https://support.apple.com/en-us/ht207935) to enable screen recording.
				`
			})
	},
	{
		key: 'what else',
		title: 'Is there anything else like this?',
		body: e(C.Markdown, {
		source: `
- [Lumen](https://lumen-app.com/) - a very stylish semimodular video synth app - Mac only
- [Radiance](https://github.com/zbanks/radiance) - a modular video synth designed for creating visuals to live music
- [Cathodemer](https://store.steampowered.com/app/697860/Cathodemer/) - I haven't tried this, but seems really cool
- [Synth](https://experiments.withgoogle.com/synth) - a WebGL video synthesizer - I can't find a working link for this, unfortunately
		`
		}),
	},
];
