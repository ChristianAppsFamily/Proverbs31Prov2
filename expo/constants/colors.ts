const Colors = {
  plum: "#A28CA1",
  plumDark: "#8A7489",
  gold: "#C2A47E",
  goldDark: "#A8895F",
  ink: "#424E4E",
  inkMuted: "#6B7575",
  cream: "#F8F5EE",
  creamDeep: "#F1ECDF",
  mist: "#E1E6E9",
  white: "#FFFFFF",
  overlay: "rgba(66, 78, 78, 0.08)",
  shadow: "rgba(66, 78, 78, 0.12)",
};

export default {
  ...Colors,
  light: {
    text: Colors.ink,
    background: Colors.cream,
    tint: Colors.plum,
    tabIconDefault: "#9AA3A3",
    tabIconSelected: Colors.plum,
  },
};
