/**
 * Browser detection solution using User-Agent Client Hints API with fallback strategy
 * Supports: Chrome/Edge (Chromium), Firefox, Safari (including iPad), Opera
 *
 * Architecture principles:
 * 1. Progressive enhancement: Client Hints (modern) → UA string parsing (fallback)
 * 2. Privacy-first: Only requests needed hints, respects browser policies
 * 3. Performance: Caches results, avoids redundant parsing
 * 4. Type-safe: Full TypeScript coverage with discriminated unions
 */

// Type Definitions

/**
 * Supported browser engines with their characteristics
 */
export enum BrowserEngine {
  BLINK = 'blink',      // Chrome, Edge, Opera (Chromium-based)
  GECKO = 'gecko',      // Firefox
  WEBKIT = 'webkit',    // Safari
  UNKNOWN = 'unknown'
}

/**
 * Specific browser brands
 */
export enum BrowserBrand {
  CHROME = 'Chrome',
  CHROMIUM = 'Chromium',
  EDGE = 'Edge',
  FIREFOX = 'Firefox',
  SAFARI = 'Safari',
  OPERA = 'Opera',
  CRIOS = 'CriOS',        // Chrome on iOS
  OPERA_MOBILE = 'OPR',   // Opera Mobile
  UNKNOWN = 'Unknown'
}

/**
 * Operating systems
 */
export enum OperatingSystem {
  WINDOWS = 'Windows',
  MACOS = 'macOS',
  LINUX = 'Linux',
  ANDROID = 'Android',
  IOS = 'iOS',
  UNKNOWN = 'Unknown'
}

/**
 * Device form factors
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown'
}

interface NavigatorWithUAData extends Navigator {
  userAgentData?: {
    brands: Array<{ brand: string; version: string }>;
    mobile: boolean;
    platform: string;
    getHighEntropyValues: (hints: string[]) => Promise<any>;
  }
}

/**
 * Comprehensive browser information object
 */
export interface BrowserInfo {
  readonly engine: BrowserEngine;
  readonly brand: BrowserBrand;
  readonly version: string;
  readonly majorVersion: number;
  readonly os: OperatingSystem;
  readonly osVersion: string;
  readonly deviceType: DeviceType;
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isSecureContext: boolean;
  readonly userAgent: string;
  readonly source: 'client-hints' | 'user-agent';
}

/**
 * High-entropy Client Hints data structure
 */
interface ClientHintsData {
  brands: Array<{ brand: string; version: string }>;
  mobile: boolean;
  platform: string;
  platformVersion?: string;
  architecture?: string;
  bitness?: string;
  model?: string;
  fullVersionList?: Array<{ brand: string; version: string }>;
}

// Internal Utilities

/**
 * Safely checks if code is running in secure context (HTTPS)
 */
const isSecureContext = (): boolean => {
  return Boolean(typeof window !== 'undefined' && window.isSecureContext)
}

/**
 * Validates navigator object availability
 */
const getNavigator = (): NavigatorWithUAData | null => {
  if (typeof window !== 'undefined') {
    return window.navigator ?? null
  }

  return null
}

/**
 * Parses semantic version string and extracts major version
 * Handles: "120.0.0.0", "120.0", "120"
 */
const parseMajorVersion = (version: string): number => {
  if (!version) return 0

  const major = version.split('.')[0]
  const parsed = parseInt(major, 10)

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : 0
}

/**
 * Extracts OS version from various UA formats
 * Examples: "10_15_7" → "10.15.7", "10.0" → "10.0"
 */
const extractOSVersion = (ua: string, os: OperatingSystem): string => {
  switch (os) {
    case OperatingSystem.WINDOWS: {
      // Windows NT 10.0 → 10, Windows NT 6.1 → 7 (Vista), etc.
      const match = ua.match(/Windows NT ([\d.]+)/)
      return match ? match[1] : 'unknown'
    }
    case OperatingSystem.MACOS: {
      // Mac OS X 10_15_7 → 10.15.7
      const match = ua.match(/Mac OS X ([\d_]+)/)
      return match ? match[1].replace(/_/g, '.') : 'unknown'
    }
    case OperatingSystem.ANDROID: {
      // Android 12, Android 13.0, etc.
      const match = ua.match(/Android ([\d.]+)/)
      return match ? match[1] : 'unknown'
    }
    case OperatingSystem.IOS: {
      // CPU OS 16_0_0 like Mac OS X → 16.0.0
      const match = ua.match(/CPU OS ([\d_]+)|OS ([\d_]+)/)
      const version = match ? (match[1] || match[2]) : ''
      return version ? version.replace(/_/g, '.') : 'unknown'
    }
    default:
      return 'unknown'
  }
}

/**
 * Detects operating system from user agent string
 * Order matters: check specific patterns first
 */
const detectOSFromUA = (ua: string): OperatingSystem => {
  if (/windows|win32/i.test(ua)) return OperatingSystem.WINDOWS
  if (/iphone|ipod/i.test(ua)) return OperatingSystem.IOS
  if (/ipad|macintosh|mac os/i.test(ua)) {
    // iPad detection: requires additional heuristics (see below)
    return OperatingSystem.MACOS
  }
  if (/android/i.test(ua)) return OperatingSystem.ANDROID
  if (/linux/i.test(ua)) return OperatingSystem.LINUX
  return OperatingSystem.UNKNOWN
}

/**
 * Detects browser brand from User-Agent Client Hints brands array
 * Chromium-based browsers report multiple brands, so order is important
 */
const detectBrandFromHints = (
  brands: Array<{ brand: string; version: string }>
): BrowserBrand => {
  for (const { brand } of brands) {
    if (/^Chromium$/i.test(brand)) return BrowserBrand.CHROMIUM
    if (/^Google Chrome$/i.test(brand)) return BrowserBrand.CHROME
    if (/^Microsoft Edge$/i.test(brand) || /^Edge$/i.test(brand)) return BrowserBrand.EDGE
    if (/^Opera$/i.test(brand)) return BrowserBrand.OPERA
  }

  return BrowserBrand.UNKNOWN
}

/**
 * Detects browser brand from user agent string
 * Must handle UA spoofing and browser-specific patterns
 */
const detectBrandFromUA = (ua: string): BrowserBrand => {
  // Order is critical: check specific patterns before generic ones

  // Edge detection (must come before Chrome check)
  if (/\bEdg(e|A|iOS)?\//i.test(ua)) return BrowserBrand.EDGE

  // Firefox detection (must come before Safari)
  if (/firefox/i.test(ua)) return BrowserBrand.FIREFOX

  // Opera detection (must come before Chrome)
  if (/OPR\/|Opera\//i.test(ua)) return BrowserBrand.OPERA

  // Chrome on IOS
  if (/crios/i.test(ua)) return BrowserBrand.CRIOS

  // Safari detection (must check absence of Chrome)
  if (/safari/i.test(ua) && !/chrome|crios|edg(e|a|ios)?/i.test(ua)) {
    return BrowserBrand.SAFARI
  }

  // Chrome variants (Chrome, Chromium)
  if (/chrome/i.test(ua) && !/crios/i.test(ua)) return BrowserBrand.CHROME
  if (/chromium/i.test(ua)) return BrowserBrand.CHROMIUM

  return BrowserBrand.UNKNOWN
}

/**
 * Detects browser engine based on brand
 */
const getEngineFromBrand = (brand: BrowserBrand): BrowserEngine => {
  switch (brand) {
    case BrowserBrand.CHROME:
    case BrowserBrand.CHROMIUM:
    case BrowserBrand.EDGE:
    case BrowserBrand.CRIOS:
    case BrowserBrand.OPERA:
    case BrowserBrand.OPERA_MOBILE:
      return BrowserEngine.BLINK
    case BrowserBrand.FIREFOX:
      return BrowserEngine.GECKO
    case BrowserBrand.SAFARI:
      return BrowserEngine.WEBKIT
    default:
      return BrowserEngine.UNKNOWN
  }
}

/**
 * Detects device type from User-Agent Client Hints
 * Preferred method as it includes high-entropy form factors
 */
const detectDeviceTypeFromHints = (
  hints: ClientHintsData | undefined,
  ua: string
): { deviceType: DeviceType; isTablet: boolean } => {
  // First, try formFactors from high-entropy hints if available
  if (hints && 'formFactors' in hints && Array.isArray(hints.formFactors)) {
    for (const factor of hints.formFactors) {
      if (factor === 'Tablet') {
        return { deviceType: DeviceType.TABLET, isTablet: true }
      }
    }
  }

  // Fall back to mobile flag from low-entropy hints
  if (hints?.mobile) {
    // Need to distinguish tablet from phone
    return detectDeviceTypeFromUA(ua)
  }

  return { deviceType: DeviceType.DESKTOP, isTablet: false }
}

/**
 * Detects device type from user agent string
 * Less reliable but works for all browsers
 */
const detectDeviceTypeFromUA = (ua: string): { deviceType: DeviceType; isTablet: boolean } => {
  const isIPad = /iPad|iPadOS|Macintosh.*Safari.*AppleWebKit.*Version\/1[6-9]/.test(ua)
  const isTablet = isIPad || /android(?!.*mobile)|tablet|playbook|silk|kindle/i.test(ua)
  const isMobile = /mobile|iphone|ipod|android|windows phone|blackberry|opera mini/i.test(ua)

  if (isTablet) {
    return { deviceType: DeviceType.TABLET, isTablet: true }
  }
  if (isMobile && !isTablet) {
    return { deviceType: DeviceType.MOBILE, isTablet: false }
  }

  return { deviceType: DeviceType.DESKTOP, isTablet: false }
}

/**
 * Detects iPad on iOS 13+ where Safari reports macOS UA
 * Uses: UA pattern + touch capability + iOS platform hints
 */
const detectIPadOS13Plus = (ua: string, hints?: ClientHintsData): boolean => {
  if (typeof window === 'undefined') return false

  // iOS 13+ iPad detection via multiple heuristics
  const hasWebKitUA = /AppleWebKit\/6\d{2}/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Firefox|Edg/i.test(ua)
  const hasMacintoshUA = /Macintosh.*AppleWebKit/i.test(ua)
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // iPadOS 13+ signature: Macintosh UA + WebKit Safari + Touch
  if (hasWebKitUA && hasMacintoshUA && hasTouchSupport) {
    return true
  }

  // Client Hints fallback (Chrome/Edge)
  if (hints && hasClientHintsIPadIndicators(hints)) {
    return true
  }

  // Explicit iPad markers
  return hasIpadMarkers(ua)
}

/**
 * Checks for iPad-specific markers in user agent
 */
const hasIpadMarkers = (ua: string): boolean => {
  // Direct iPad mention in UA
  if (/\biPad\b/.test(ua)) return true

  // iOS UA pattern in older versions
  return /CPU OS.*like Mac OS X/.test(ua) && !/iPhone|iPod/.test(ua)
}

/**
 * Checks Client Hints for iPad indicators
 */
const hasClientHintsIPadIndicators = (hints?: ClientHintsData): boolean => {
  if (!hints) return false

  // Direct iPad model mention
  if (hints.model && /iPad/i.test(hints.model)) return true

  // Platform is macOS but formFactors includes Tablet (iPadOS 26+)
  if ('formFactors' in hints && Array.isArray(hints.formFactors)) {
    if (hints.formFactors.includes('Tablet') && hints.platform === 'macOS') {
      return true
    }
  }

  return false
}

/**
 * Attempts to retrieve high-entropy Client Hints data
 * Only works in secure context (HTTPS)
 */
const fetchClientHints = async (): Promise<ClientHintsData | null> => {
  const navigator = getNavigator()

  if (!navigator?.userAgentData) return null
  if (!isSecureContext()) return null

  try {
    const hints = await (navigator.userAgentData as any).getHighEntropyValues([
      'architecture',
      'bitness',
      'formFactors',
      'fullVersionList',
      'model',
      'platformVersion',
    ])

    return {
      brands: navigator.userAgentData.brands ?? [],
      mobile: navigator.userAgentData.mobile ?? false,
      platform: navigator.userAgentData.platform ?? 'unknown',
      ...hints
    } as ClientHintsData
  } catch {
    // Browser may reject high-entropy request or API unavailable
    return {
      brands: navigator.userAgentData.brands ?? [],
      mobile: navigator.userAgentData.mobile ?? false,
      platform: navigator.userAgentData.platform ?? 'unknown'
    }
  }
}

// Main Detection Logic (Memoized)

let cachedBrowserInfo: BrowserInfo | null = null
let detectionPromise: Promise<BrowserInfo> | null = null

/**
 * Core browser detection function
 * Uses Client Hints when available, falls back to user agent parsing
 */
async function detectBrowserImpl(): Promise<BrowserInfo> {
  const navigator = getNavigator()
  const userAgent = navigator?.userAgent ?? ''
  const secure = isSecureContext()

  let clientHints: ClientHintsData | null = null

  // Try to fetch Client Hints (Chrome 90+, Edge 90+, Opera 76+)
  if (secure && navigator && 'userAgentData' in navigator) {
    clientHints = await fetchClientHints()
  }

  // Determine browser brand
  let brand = BrowserBrand.UNKNOWN
  let version = '0.0.0'
  let source: 'client-hints' | 'user-agent' = 'user-agent'

  if (clientHints && clientHints.brands.length > 0) {
    brand = detectBrandFromHints(clientHints.brands)
    version = clientHints.brands[0]?.version ?? '0'
    source = 'client-hints'
  }

  // Fallback to UA parsing if Client Hints didn't work
  if (brand === BrowserBrand.UNKNOWN) {
    brand = detectBrandFromUA(userAgent)
    const versionMatch = userAgent.match(/version\/([\d.]+)|chrome\/([\d.]+)|firefox\/([\d.]+)|edg(e|a|ios)?\/([\d.]+)|opr\/([\d.]+)/i)
    version = versionMatch
      ? (versionMatch[1] || versionMatch[2] || versionMatch[3] || versionMatch[4] || versionMatch[5] || '0')
      : '0'
  }

  const engine = getEngineFromBrand(brand)

  // Detect OS
  let os = detectOSFromUA(userAgent)
  let isIPadDetected = detectIPadOS13Plus(userAgent, clientHints ?? undefined)
  if (isIPadDetected) {
    os = OperatingSystem.IOS
  }

  // Use OS from Client Hints if available
  if (clientHints && clientHints.platform) {
    const platform = clientHints.platform
    const platformMap: Record<string, OperatingSystem> = {
      'Windows': OperatingSystem.WINDOWS,
      'macOS': OperatingSystem.MACOS,
      'Linux': OperatingSystem.LINUX,
      'Android': OperatingSystem.ANDROID
    }

    os = platformMap[platform] ?? os
  }

  // Detect device type
  let deviceType: DeviceType
  let isTablet

  if (isIPadDetected) {
    deviceType = DeviceType.TABLET
    isTablet = true
  } else {
    const hintsForDetection = clientHints ?? undefined
    const { deviceType: dt, isTablet: it } = clientHints
      ? detectDeviceTypeFromHints(hintsForDetection, userAgent)
      : detectDeviceTypeFromUA(userAgent)
    deviceType = dt
    isTablet = it
  }

  const isMobile = deviceType === DeviceType.MOBILE || clientHints?.mobile === true
  const osVersion = clientHints?.platformVersion ?? extractOSVersion(userAgent, os)
  const majorVersion = parseMajorVersion(version)

  return {
    engine,
    brand,
    version,
    majorVersion,
    os,
    osVersion,
    deviceType,
    isMobile,
    isTablet,
    isSecureContext: secure,
    userAgent,
    source
  }
}

// Public API

/**
 * Asynchronously detects browser information
 * Uses memoization to avoid redundant detection
 *
 * @returns Promise resolving to comprehensive BrowserInfo object
 *
 * @example
 * ```typescript
 * const browserInfo = await detectBrowser();
 * console.log(browserInfo.brand); // 'Chrome'
 * console.log(browserInfo.majorVersion); // 120
 * if (browserInfo.deviceType === DeviceType.MOBILE) {
 *   // Optimize for mobile
 * }
 * ```
 */
export async function detectBrowser(): Promise<BrowserInfo> {
  // Return cached result if available
  if (cachedBrowserInfo) {
    return cachedBrowserInfo
  }

  // Return existing promise if detection is in progress
  if (detectionPromise) {
    return detectionPromise
  }

  // Create detection promise
  detectionPromise = detectBrowserImpl()
    .then((info) => {
      cachedBrowserInfo = info
      return info
    })

  return detectionPromise
}

/**
 * Synchronous browser detection using user agent string only
 * Faster but less accurate than detectBrowser()
 * Useful when async is not available
 *
 * @returns Partial BrowserInfo with UA-based detection only
 *
 * @example
 * ```typescript
 * const browserInfo = detectBrowserSync();
 * if (browserInfo.brand === BrowserBrand.FIREFOX) {
 *   // Firefox-specific code
 * }
 * ```
 */
export function detectBrowserSync(): Partial<BrowserInfo> {
  const navigator = getNavigator()
  const userAgent = navigator?.userAgent ?? ''

  const brand = detectBrandFromUA(userAgent)
  const engine = getEngineFromBrand(brand)
  const os = detectOSFromUA(userAgent)

  const versionMatch = userAgent.match(/version\/([\d.]+)|chrome\/([\d.]+)|firefox\/([\d.]+)|edg(e|a|ios)?\/([\d.]+)|opr\/([\d.]+)/i)
  const version = versionMatch ? (versionMatch[1] || versionMatch[2] || versionMatch[3] || versionMatch[4] || versionMatch[5] || '0') : '0'

  const { deviceType, isTablet } = detectDeviceTypeFromUA(userAgent)

  return {
    engine,
    brand,
    version,
    majorVersion: parseMajorVersion(version),
    os,
    osVersion: extractOSVersion(userAgent, os),
    deviceType,
    isMobile: deviceType === DeviceType.MOBILE,
    isTablet,
    userAgent,
    source: 'user-agent'
  }
}

/**
 * Clears memoized browser detection result
 * Useful for testing or forcing re-detection
 */
export function clearBrowserCache(): void {
  cachedBrowserInfo = null
  detectionPromise = null
}

/**
 * Checks if browser supports specific feature
 * Combines engine detection with version checking
 *
 * @param feature Feature identifier
 * @param browserInfo Optional pre-detected browser info
 * @returns Whether feature is supported
 *
 * @example
 * ```typescript
 * if (await isFeatureSupported('web-workers')) {
 *   // Use Web Workers
 * }
 * ```
 */
export async function isFeatureSupported(
  feature: string,
  browserInfo?: BrowserInfo
): Promise<boolean> {
  const info = browserInfo || (await detectBrowser());

  const featureSupport: Record<string, Record<BrowserEngine, number>> = {
    'web-workers': {
      [BrowserEngine.BLINK]: 4,
      [BrowserEngine.GECKO]: 3,
      [BrowserEngine.WEBKIT]: 4,
      [BrowserEngine.UNKNOWN]: 0
    },
    'service-worker': {
      [BrowserEngine.BLINK]: 40,
      [BrowserEngine.GECKO]: 44,
      [BrowserEngine.WEBKIT]: 11,
      [BrowserEngine.UNKNOWN]: 0
    },
    'web-gl': {
      [BrowserEngine.BLINK]: 8,
      [BrowserEngine.GECKO]: 4,
      [BrowserEngine.WEBKIT]: 5,
      [BrowserEngine.UNKNOWN]: 0,
    },
    'fetch-api': {
      [BrowserEngine.BLINK]: 42,
      [BrowserEngine.GECKO]: 39,
      [BrowserEngine.WEBKIT]: 10,
      [BrowserEngine.UNKNOWN]: 0
    },
    'async-await': {
      [BrowserEngine.BLINK]: 55,
      [BrowserEngine.GECKO]: 52,
      [BrowserEngine.WEBKIT]: 11,
      [BrowserEngine.UNKNOWN]: 0
    }
  }

  const requiredVersion = featureSupport[feature.toLowerCase()]?.[info.engine]

  if (requiredVersion === undefined) {
    // Unknown feature, return false
    return false
  }

  if (requiredVersion === 0) {
    // Engine not supported
    return false
  }

  return info.majorVersion >= requiredVersion
}

/**
 * Gets human-readable browser identification string
 *
 * @param browserInfo Optional pre-detected browser info
 * @returns Formatted browser string (e.g., "Chrome 120 on Windows 10")
 */
export async function getBrowserString(browserInfo?: BrowserInfo): Promise<string> {
  const info = browserInfo || (await detectBrowser())
  return `${info.brand} ${info.version} on ${info.os} ${info.osVersion}`
}
