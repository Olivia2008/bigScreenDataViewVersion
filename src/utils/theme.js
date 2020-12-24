const theme = {
  chalk: {
    backgroundColor: "#161522",
    titleColor: "#fff",
    logoSrc: "logo_dark.png",
    headerBorderSrc: "header_border_dark.png",
    themeSrc: "qiehuan_dark.png"
  },
  vintage: {
    backgroundColor: "#eeeeee",
    titleColor: "#000000",
    logoSrc: "logo_light2.png",
    headerBorderSrc: "header_border_light.png",
    themeSrc: "qiehuan_light.png"
  }
};

export function getTheme(arg) {
  return theme[arg];
}
