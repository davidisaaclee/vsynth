export function downloadBlob(blob: Blob, filename: string, downloadLink: HTMLAnchorElement = document.createElement('a')) {
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = filename;
	downloadLink.click();
}

