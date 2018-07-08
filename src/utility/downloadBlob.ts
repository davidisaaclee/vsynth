export function downloadBlob(blob: Blob, filename: string, downloadLink: HTMLAnchorElement = document.createElement('a')) {
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = filename;
	downloadLink.click();
}

export const isDownloadSupported: boolean =
	(() => document.createElement('a').download != null)();

