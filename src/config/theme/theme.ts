// Tokens tomados del Figma "Catalog Mobile" (Mapa de la experiencia → Marca y accesibilidad).
// El diseño solo tiene modo claro.
export const Colors = {
  primary: "#60269E",
  secondary: "#00AEC7",
  accent: "#EF509A",

  background: "#F7F7F7",
  scannerBackground: "#17151C",
  surface: "#FFFFFF",
  disabled: "#ECE7F1",
  overlay: "rgba(0,0,0,0.4)",
  selected: "#F7F2FD",
  border: "#E0E0E0",
  skeleton: "#E8E8E8",

  textPrimary: "#000000",
  textSecondary: "#757575",
  onPrimary: "#FFFFFF",

  success: "#00A650",
  successText: "#007C3C",
  successBackground: "#EAF7EF",
  warning: "#FFC107",
  warningBackground: "#FFF8DE",
  danger: "#B12704",
  dangerBackground: "#FFF0EC",
  info: "#3483FA",
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  subtitle: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 16 },
  wordmark: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40 },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 12, lg: 16, xl: 20, full: 999 };

// Altura mínima de cualquier elemento tocable (Figma: Targets ≥48).
export const touchTarget = 48;

// Grosor de todos los íconos del Figma (Lucide), sin importar su tamaño.
export const iconStroke = 1.8;
