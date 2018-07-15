// https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
export function resizeCanvas(
	canvas: HTMLCanvasElement,
	realToCSSPixels: number = window.devicePixelRatio,
) {
	// Lookup the size the browser is displaying the canvas in CSS pixels
	// and compute a size needed to make our drawingbuffer match it in
	// device pixels.
	const displayWidth =
		Math.floor(canvas.clientWidth * realToCSSPixels);
	const displayHeight =
		Math.floor(canvas.clientHeight * realToCSSPixels);

	// Check if the canvas is not the same size.
	if (canvas.width !== displayWidth ||
		canvas.height !== displayHeight) {

		// Make the canvas the same size
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}
}

