let clipboardClearTimer: NodeJS.Timeout | null = null;

export async function copyToClipboard(
  text: string, 
  onCopied?: () => void,
  clearAfterMs: number = 30000
): Promise<void> {
  await navigator.clipboard.writeText(text);
  
  onCopied?.();
  
  if (clipboardClearTimer) {
    clearTimeout(clipboardClearTimer);
  }
  
  clipboardClearTimer = setTimeout(async () => {
    try {
      const current = await navigator.clipboard.readText();
      if (current === text) {
        await navigator.clipboard.writeText('');
      }
    } catch {
    }
    clipboardClearTimer = null;
  }, clearAfterMs);
}

export function cancelClipboardClear(): void {
  if (clipboardClearTimer) {
    clearTimeout(clipboardClearTimer);
    clipboardClearTimer = null;
  }
}
