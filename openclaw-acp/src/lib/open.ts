// =============================================================================
// Open a URL in the user's default browser. Platform-specific, no dependencies.
// =============================================================================

import { execFile } from "child_process";

export function openUrl(url: string): void {
  const platform = process.platform;

  if (platform === "darwin") {
    execFile("open", [url], () => {});
  } else if (platform === "win32") {
    execFile("cmd", ["/c", "start", "", url], () => {});
  } else {
    execFile("xdg-open", [url], () => {});
  }
}
