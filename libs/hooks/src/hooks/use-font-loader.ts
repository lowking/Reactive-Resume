import { useEffect, useMemo } from "react";
import { fonts } from "@reactive-resume/utils";

// fontString 形如 "Roboto:400,700:latin"
function parseFontString(fontString: string) {
  const [family, variants, subset] = fontString.split(":");
  return {
    family,
    variants: variants?.split(",") ?? [],
    subset: subset || "",
  };
}

export function useFontLoader(fontString: string) {
  useEffect(() => {
    if (!fontString) return;
    const { family, variants } = parseFontString(fontString);

    const font = fonts.find(
      (f) => f.family.toLowerCase() === family?.toLowerCase()
    );
    if (!font) return;

    // 移除旧样式
    const prev = document.getElementById("custom-fonts-style");
    if (prev) prev.remove();

    let css = "";
    variants.forEach((variant) => {
      const url = font.files[variant];
      if (!url) return;
      css += `
@font-face {
  font-family: '${font.family}';
  font-style: normal;
  font-weight: ${variant};
  src: url('${url}') format('woff2');
  font-display: swap;
}
`;
    });

    if (css) {
      const style = document.createElement("style");
      style.id = "custom-fonts-style";
      style.textContent = css;
      document.head.appendChild(style);
    }

    // 页面加载完后通知
    const width = window.document.body.offsetWidth;
    const height = window.document.body.offsetHeight;
    const message = { type: "PAGE_LOADED", payload: { width, height } };
    window.postMessage(message, "*");

    return () => {
      const s = document.getElementById("custom-fonts-style");
      if (s) s.remove();
    };
  }, [fontString]);
}
