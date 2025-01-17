// Add data types to window.navigator for use in this file. See https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types- for more info.
/// <reference types="user-agent-data-types" />

const navigatorErrorMessage =
  'Could not find `userAgent` or `userAgentData` window.navigator properties to set `os`, `browser` and `version`';
const removeExcessMozillaAndVersion = /^mozilla\/\d\.\d\W/;
const browserPattern = /(\w+)\/(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/g;
const engineAndVersionPattern = /^(ver|cri|gec)/;
const brandList = ['chrome', 'opera', 'safari', 'edge', 'firefox'];
const empty = '';
const { isArray } = Array;

const mobiles: Record<string, RegExp> = {
  iphone: /iphone/,
  ipad: /ipad|macintosh/,
  android: /android/,
} as const;

const desktops: Record<string, RegExp> = {
  windows: /win/,
  mac: /macintosh/,
  linux: /linux/,
} as const;

export function detectPlatform(
  customUserAgent?: NavigatorID['userAgent'],
  customUserAgentData?: NavigatorUAData,
): PlatformType {
  const userAgent =
    typeof customUserAgent === 'string'
      ? customUserAgent
      : window.navigator.userAgent;
  const userAgentData = customUserAgentData ?? window.navigator.userAgentData;

  if (userAgentData) {
    const os = userAgentData.platform.toLowerCase();
    let platformData: { browser: string; version: string } | undefined;

    // Extract platform brand and version information.
    for (const agentBrand of userAgentData.brands) {
      const agentBrandEntry = agentBrand.brand.toLowerCase();
      const foundBrand = brandList.find((brand) => {
        //eslint-disable-line
        if (agentBrandEntry.includes(brand)) {
          return brand;
        }
      });
      if (foundBrand) {
        platformData = { browser: foundBrand, version: agentBrand.version };
        break;
      }
    }
    const brandVersionData = platformData || { browser: empty, version: empty };
    const type = userAgentData.mobile ? 'mobile' : 'desktop';

    return { os, type, ...brandVersionData };
  }

  if (userAgent) {
    const ua = userAgent
      .toLowerCase()
      .replace(removeExcessMozillaAndVersion, empty);

    // Determine the operating system.
    const mobileOS = Object.keys(mobiles).find(
      (os) => mobiles[os].test(ua) && window.navigator.maxTouchPoints >= 1,
    );
    const desktopOS = Object.keys(desktops).find((os) => desktops[os].test(ua));
    const os = mobileOS || desktopOS || empty;
    const type = mobileOS ? 'mobile' : 'desktop';

    // Extract browser and version information.
    const browserTest = ua.match(browserPattern);
    const versionRegex = /version\/(\d+(\.\d+)*)/;
    const safariVersion = ua.match(versionRegex);
    const saVesion = isArray(safariVersion) ? safariVersion[1] : null;
    const browserOffset =
      browserTest &&
      (browserTest.length > 2 && !engineAndVersionPattern.test(browserTest[1])
        ? 1
        : 0);
    const browserResult =
      browserTest &&
      (
        browserTest?.[browserTest.length - 1 - (browserOffset || 0)] ?? ''
      ).split('/');
    const [browserResult1, browserResult2] = browserResult ?? [];
    const browser = (browserResult && browserResult1) || empty;
    const version =
      (saVesion ? saVesion : browserResult && browserResult2) || empty;

    return { os, type, browser, version };
  }

  // Log error message if there's a problem.
  console.error(navigatorErrorMessage);

  return {
    // Ignore the VSCode strikethough. Disable linting line if necessary. This is just a fallback
    os: navigator.platform || empty,
    type: empty,
    browser: empty,
    version: empty,
  };
}
