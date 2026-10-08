/*
  The two platform APIs the ui uses that the DOM typings do not have.

  `BarcodeDetector` is a real web API in Chromium and Safari, still behind a flag
  or absent elsewhere, and no TypeScript release has shipped it. The ui asks for
  it through a guard (`seasonCanScan()` reports whether this build can scan at
  all), so what is missing here is only the name.

  An honest declaration, not a cast: the shape is the part the code touches.
*/
interface Window {
  BarcodeDetector?: new (opts?: { formats?: string[] }) => {
    detect(source: any): Promise<Array<{ rawValue: string }>>;
  };
}
