import { codeToHtml } from "https://esm.sh/shiki@latest";
import JSZip from "https://esm.sh/jszip@latest";

const PALETTE = {
  primary: [
    { name: "aegean", hex: "#5088C5" },
    { name: "amber", hex: "#F28360" },
    { name: "seaweed", hex: "#3B9886" },
    { name: "canary", hex: "#F7B846" },
    { name: "aster", hex: "#7A77AB" },
    { name: "rose", hex: "#F898AE" },
    { name: "vital", hex: "#73B5E3" },
    { name: "tangerine", hex: "#FFB984" },
    { name: "lime", hex: "#97CD78" },
    { name: "dragon", hex: "#C85152" },
    { name: "oat", hex: "#F5E4BE" },
    { name: "wish", hex: "#BABEE0" },
  ],
  neutral: [
    { name: "pitch", hex: "#09090A" },
    { name: "crow", hex: "#292928" },
    { name: "slate", hex: "#43413F" },
    { name: "bark", hex: "#8F8885" },
    { name: "chateau", hex: "#BAB0A8" },
    { name: "gray", hex: "#EBEDE8" },
    { name: "parchment", hex: "#FDF8F2" },
  ],
  shades: [
    { name: "lapis", hex: "#2B65A1" },
    { name: "dusk", hex: "#094468" },
    { name: "cinnabar", hex: "#9E3F41" },
    { name: "mustard", hex: "#D68D22" },
    { name: "tanzanite", hex: "#54448C" },
    { name: "asparagus", hex: "#2A6B5E" },
    { name: "depths", hex: "#09473E" },
    { name: "fern", hex: "#47784A" },
    { name: "matcha", hex: "#71AC5A" },
    { name: "azalea", hex: "#C14C70" },
    { name: "steel", hex: "#687787" },
  ],
  backgrounds: [
    { name: "parchment", hex: "#FDF8F2" },
    { name: "zephyr", hex: "#F4FBFF" },
    { name: "lichen", hex: "#F7FBEF" },
    { name: "dawn", hex: "#F8F4F1" },
    { name: "white", hex: "#FFFFFF" },
    { name: "crow", hex: "#292928" },
    { name: "pitch", hex: "#09090A" },
  ],
};

const TOKEN_CATEGORIES = [
  {
    id: "keyword",
    label: "Keyword",
    tmScopes: ["keyword", "keyword.control"],
    pandocTokens: ["Keyword", "ControlFlow"],
  },
  {
    id: "error",
    label: "Error",
    tmScopes: ["invalid"],
    pandocTokens: ["Error", "Alert", "Warning"],
  },
  {
    id: "string",
    label: "String",
    tmScopes: ["string"],
    pandocTokens: ["String", "Char", "VerbatimString", "SpecialString", "SpecialChar"],
  },
  {
    id: "function",
    label: "Function",
    tmScopes: ["entity.name.function", "support.function"],
    pandocTokens: ["Function"],
  },
  {
    id: "comment",
    label: "Comment",
    tmScopes: ["comment"],
    pandocTokens: ["Comment", "Documentation", "CommentVar", "Annotation"],
  },
  {
    id: "type",
    label: "Type",
    tmScopes: ["entity.name.type", "storage.type", "support.type"],
    pandocTokens: ["DataType"],
  },
  {
    id: "variable",
    label: "Variable",
    tmScopes: ["variable", "variable.parameter"],
    pandocTokens: ["Variable"],
  },
  {
    id: "number",
    label: "Number",
    tmScopes: ["constant.numeric"],
    pandocTokens: ["DecVal", "BaseN", "Float"],
  },
  {
    id: "constant",
    label: "Constant",
    tmScopes: ["constant.language"],
    pandocTokens: ["Constant", "BuiltIn"],
  },
  {
    id: "operator",
    label: "Operator",
    tmScopes: ["keyword.operator"],
    pandocTokens: ["Operator"],
  },
  {
    id: "import",
    label: "Import",
    tmScopes: ["keyword.import", "keyword.control.import"],
    pandocTokens: ["Import", "Preprocessor"],
  },
  {
    id: "attribute",
    label: "Attribute",
    tmScopes: ["entity.other.attribute-name", "entity.other.inherited-class"],
    pandocTokens: ["Attribute"],
  },
];

const GLOBAL_SETTINGS = [
  { id: "background", label: "Background" },
  { id: "foreground", label: "Foreground" },
];

const ALL_PANDOC_TOKENS = [
  "Alert", "Annotation", "Attribute", "BaseN", "BuiltIn", "Char",
  "Comment", "CommentVar", "Constant", "ControlFlow", "DataType",
  "DecVal", "Documentation", "Error", "Extension", "Float",
  "Function", "Import", "Information", "Keyword", "Operator",
  "Other", "Preprocessor", "RegionMarker", "SpecialChar",
  "SpecialString", "String", "Variable", "VerbatimString", "Warning",
];

const CODE_SAMPLE = `from __future__ import annotations
from dataclasses import dataclass

import matplotlib.colors as mcolors

from arcadia_pycolor.display import colorize
from arcadia_pycolor.hexcode import HexCode
from arcadia_pycolor.palette import Palette
from arcadia_pycolor.utils import (
    NumericSequence,
    distribute_values,
    interpolate_x_values,
    is_monotonic,
    rescale_and_concatenate_values,
)


@dataclass
class Anchor:
    """
    A paired color and position value for a gradient.

    Args:
        color: A HexCode object representing the color
        value: A numeric value between 0 and 1 representing the position in the gradient
    """

    color: HexCode
    value: float


class Gradient:
    """A sequence of colors and their positions that define a continuous color gradient.

    Each color is paired with a numeric value between 0 and 1 that determines its position
    in the gradient. The first color is always at position 0 and the last color at position 1.
    Colors in between are interpolated based on their position values to create a smooth gradient.

    Attributes:
        name (str): The name of the gradient.
        anchors (list[Anchor]): A list of gradient anchors.

    Properties:
        anchor_colors (list[HexCode]):
            The list of HexCodes corresponding to each anchor.
        anchor_values (list[float]):
            The list of values corresponding to each anchor.
    """

    def __init__(self, name: str, colors: list[HexCode], values: list[float] | None = None):
        """Initializes a Gradient.

        Args:
            name: The name of the gradient.
            colors: A list of HexCodes.
            values: An optional list of float values. See class docstring for details.

        Raises:
            ValueError:
                - If there are less than two values.
                - If the values are not integers or floats.
                - If the values are not between 0 and 1.
                - If the first value is not 0 or the last value is not 1.
                - If the number of values is not the same as the number of colors.
        """
        self.name = name

        # Validate that all colors are HexCode instances
        if not all(isinstance(color, HexCode) for color in colors):
            raise ValueError("All colors must be HexCode objects.")

        if values is not None:
            # Ensure we have enough anchor points
            if len(values) < 2:
                raise ValueError("A gradient must have at least two values.")
            if not all(isinstance(value, (int, float)) for value in values):
                raise ValueError("All values must be integers or floats.")
            if not all(0 <= value <= 1 for value in values):
                raise ValueError("All values must be between 0 and 1.")
            # First and last anchors must be at the boundaries
            if not values[0] == 0 or not values[-1] == 1:
                raise ValueError("The first value must be 0 and the last value must be 1.")
            if len(colors) != len(values):
                raise ValueError("The number of colors and values must be the same.")
            anchor_values = values
        else:
            # Default to evenly spaced anchors
            anchor_values = distribute_values(len(colors))

        # Pair each color with its position
        self.anchors = [Anchor(color, value) for color, value in zip(colors, anchor_values)]

    @property
    def anchor_colors(self) -> list[HexCode]:
        return [anchor.color for anchor in self.anchors]

    @property
    def anchor_values(self) -> list[float]:
        return [anchor.value for anchor in self.anchors]

    @property
    def num_anchors(self) -> int:
        """Returns the number of anchors in the gradient"""
        return len(self.anchors)

    @classmethod
    def from_dict(
        cls, name: str, colors: dict[str, str], values: list[float] | None = None
    ) -> Gradient:
        """Creates a gradient from a dictionary of colors and values."""
        hex_codes = [HexCode(name, hex_code) for name, hex_code in colors.items()]
        return cls(name, hex_codes, values)

    def swatch(self, steps: int = 21) -> str:
        """
        Returns a gradient swatch with the specified number of steps.

        Args:
            steps (int): the number of swatches to display in the gradient
        """
        # Build the colormap and sample it at each step
        cmap = self.to_mpl_cmap()

        colors = [
            HexCode(name=str(ind), hex_code=mcolors.to_hex(cmap(ind / steps)))
            for ind in range(steps)
        ]

        # Render each color as a colored block of whitespace
        swatches = [colorize(" ", bg_color=c) for c in colors]

        return "".join(swatches)

    def reverse(self) -> Gradient:
        """Returns a new gradient with the colors and values in reverse order"""
        return Gradient(
            name=f"{self.name}_r",
            colors=self.anchor_colors[::-1],
            values=[1 - value for value in self.anchor_values[::-1]],
        )

    def resample_as_palette(self, steps: int = 5) -> Palette:
        """Returns a resampled gradient as a Palette with the specified number of steps."""
        gradient = self.to_mpl_cmap()
        values = distribute_values(steps)
        colors = [
            HexCode(name=f"{self.name}_{i}", hex_code=mcolors.to_hex(gradient(value)))
            for i, value in enumerate(values)
        ]

        return Palette(
            name=f"{self.name}_resampled_{steps}",
            colors=colors,
        )

    def map_values(
        self,
        values: NumericSequence,
        min_value: float | None = None,
        max_value: float | None = None,
    ) -> list[HexCode]:
        """Maps a sequence of values to their corresponding colors from a gradient.

        Args:
            values (NumericSequence): A sequence of values to map to colors.
            min_value (float, optional):
                Determines which value corresponds to the first color in the spectrum.
                Any values below this minimum are assigned to the first color.
                If not provided, the minimum value of \`values\` is chosen.
            max_value (float, optional):
                Determines which value corresponds to the last color in the spectrum.
                Any values greater than this maximum are assigned to the last color.
                If not provided, the maximum value of \`values\` is chosen.

        Returns:
            list[HexCode]: A list of HexCode objects corresponding to the values.
        """
        if not len(values):
            return []

        if min_value is None:
            min_value = min(values)

        if max_value is None:
            max_value = max(values)

        if min_value >= max_value:
            raise ValueError(
                f"max_value ({max_value}) must be greater than min_value ({min_value})."
            )

        cmap = self.to_mpl_cmap()

        # Scale values to [0, 1] range for colormap lookup
        normalized_values = [(value - min_value) / (max_value - min_value) for value in values]

        # Convert each normalized value to its corresponding color
        return [HexCode(f"{value}", mcolors.to_hex(cmap(value))) for value in normalized_values]

    def interpolate_lightness(self) -> Gradient:
        """Interpolates the gradient to new values based on lightness."""

        if self.num_anchors < 3:
            raise ValueError("Interpolation requires at least three colors.")
        if not is_monotonic(self.anchor_values):
            raise ValueError("Lightness must be monotonically increasing or decreasing.")

        # Extract perceptual lightness from CAM02-UCS color space
        lightness_values = [color.to_cam02ucs()[0] for color in self.anchor_colors]
        new_values = interpolate_x_values(lightness_values)

        return Gradient(
            name=f"{self.name}_interpolated",
            colors=self.anchor_colors,
            values=new_values,
        )

    def __add__(self, other: Gradient) -> Gradient:
        """Return the sum of two gradients by concatenating their colors and values."""
        # Skip duplicate color if the two gradients share a boundary color
        offset = int(self.anchor_colors[-1] == other.anchor_colors[0])
        new_colors = self.anchor_colors + other.anchor_colors[offset:]
        new_values = rescale_and_concatenate_values(
            self.anchor_values, other.anchor_values[offset:]
        )

        return Gradient(
            name=f"{self.name}_{other.name}",
            colors=new_colors,
            values=new_values,
        )

    def __repr__(self) -> str:
        longest_name_length = max(len(anchor.color.name) for anchor in self.anchors)

        return "\\n".join(
            [self.swatch()]
            + [
                f"{anchor.color.swatch(min_name_width=longest_name_length)} {anchor.value}"
                for anchor in self.anchors
            ]
        )

    def to_mpl_cmap(self) -> mcolors.LinearSegmentedColormap:
        """Converts the gradient to a matplotlib colormap."""
        colors = [(anchor.value, anchor.color.hex_code) for anchor in self.anchors]
        return mcolors.LinearSegmentedColormap.from_list(
            self.name,
            colors=colors,
        )

    def to_plotly_colorscale(self) -> list[tuple[float, str]]:
        """Converts the gradient to a colorscale acceptable by plotly graph objects.

        Returns:
            list[tuple[tuple, str]]:
                A 256 (8-bit) color scale. Each element is a two-ple of normalized
                position in the colorscale and the associated hex value.
        """
        return [(i / 255.0, mcolors.rgb2hex(self.to_mpl_cmap()(i / 255.0))) for i in range(256)]
`;

const state = {
  background: "#282828",
  foreground: "#ebdbb2",
  keyword: "#fb4934",
  string: "#b8bb26",
  comment: "#928374",
  function: "#b8bb26",
  type: "#fabd2f",
  variable: "#83a598",
  number: "#d3869b",
  operator: "#fe8019",
  constant: "#d3869b",
  import: "#8ec07c",
  attribute: "#8ec07c",
  error: "#fb4934",
};

const styleState = {
  keyword: { bold: false, italic: false },
  string: { bold: false, italic: true },
  comment: { bold: false, italic: true },
  function: { bold: true, italic: false },
  type: { bold: false, italic: false },
  variable: { bold: false, italic: false },
  number: { bold: false, italic: false },
  operator: { bold: false, italic: false },
  constant: { bold: false, italic: false },
  import: { bold: false, italic: false },
  attribute: { bold: false, italic: false },
  error: { bold: true, italic: false },
};

let activePopoverTarget = null;

function colorName(hex) {
  const upper = hex.toUpperCase();
  for (const group of Object.values(PALETTE)) {
    for (const color of group) {
      if (color.hex.toUpperCase() === upper) return color.name;
    }
  }
  return hex.toLowerCase();
}

function fontStyle(id) {
  const s = styleState[id];
  if (!s) return "";
  const parts = [];
  if (s.bold) parts.push("bold");
  if (s.italic) parts.push("italic");
  return parts.join(" ");
}

function isLightBackground(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function themeName() {
  return document.getElementById("theme-name").value || "arcadia";
}

// --- Reverse lookup tables (scope/token -> category id) ---

const tmScopeToCategoryId = new Map();
for (const cat of TOKEN_CATEGORIES) {
  for (const scope of cat.tmScopes) {
    tmScopeToCategoryId.set(scope, cat.id);
  }
}

const pandocTokenToCategoryId = new Map();
for (const cat of TOKEN_CATEGORIES) {
  for (const tok of cat.pandocTokens) {
    pandocTokenToCategoryId.set(tok, cat.id);
    pandocTokenToCategoryId.set(tok + "Tok", cat.id);
  }
}

// --- Theme builders (state -> export format) ---

function buildShikiTheme() {
  return {
    name: "arcadia-custom",
    type: isLightBackground(state.background) ? "light" : "dark",
    colors: {
      "editor.background": state.background,
      "editor.foreground": state.foreground,
    },
    settings: [
      {
        settings: {
          background: state.background,
          foreground: state.foreground,
        },
      },
      ...TOKEN_CATEGORIES.map((cat) => {
        const settings = { foreground: state[cat.id] };
        const fs = fontStyle(cat.id);
        if (fs) settings.fontStyle = fs;
        return { scope: cat.tmScopes, settings };
      }),
    ],
  };
}

function buildTmTheme() {
  const scopeEntries = TOKEN_CATEGORIES.map(
    (cat) => {
      const fs = fontStyle(cat.id);
      const fsEntry = fs ? `
                <key>fontStyle</key>
                <string>${fs}</string>` : "";
      return `
        <dict>
            <key>name</key>
            <string>${cat.label}</string>
            <key>scope</key>
            <string>${cat.tmScopes.join(", ")}</string>
            <key>settings</key>
            <dict>
                <key>foreground</key>
                <string>${state[cat.id]}</string>${fsEntry}
            </dict>
        </dict>`;
    }
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>name</key>
    <string>${themeName()}</string>
    <key>settings</key>
    <array>
        <dict>
            <key>settings</key>
            <dict>
                <key>background</key>
                <string>${state.background}</string>
                <key>foreground</key>
                <string>${state.foreground}</string>
            </dict>
        </dict>${scopeEntries}
    </array>
</dict>
</plist>`;
}

function buildPandocTheme() {
  const tokenToColor = {};
  const tokenToStyle = {};
  for (const cat of TOKEN_CATEGORIES) {
    for (const tok of cat.pandocTokens) {
      tokenToColor[tok] = state[cat.id];
      tokenToStyle[tok] = styleState[cat.id];
    }
  }

  const textStyles = {};
  for (const tok of ALL_PANDOC_TOKENS) {
    const s = tokenToStyle[tok] || { bold: false, italic: false };
    textStyles[tok + "Tok"] = {
      "text-color": tokenToColor[tok] || null,
      "background-color": null,
      "bold": s.bold,
      "italic": s.italic,
      "underline": false,
    };
  }

  return JSON.stringify(
    {
      metadata: {
        name: themeName(),
        author: "Arcadia Science",
        license: "",
        revision: 1,
      },
      "text-color": state.foreground,
      "background-color": state.background,
      "line-number-color": state.foreground,
      "line-number-background-color": null,
      "text-styles": textStyles,
    },
    null,
    2
  );
}

function buildVscodeTheme() {
  return JSON.stringify(
    {
      $schema: "vscode://schemas/color-theme",
      name: themeName(),
      type: isLightBackground(state.background) ? "light" : "dark",
      colors: {
        "editor.background": state.background,
        "editor.foreground": state.foreground,
      },
      tokenColors: TOKEN_CATEGORIES.map((cat) => {
        const settings = { foreground: state[cat.id] };
        const fs = fontStyle(cat.id);
        if (fs) settings.fontStyle = fs;
        return { name: cat.label, scope: cat.tmScopes, settings };
      }),
    },
    null,
    2
  );
}

// --- Theme loaders (export format -> state) ---

function loadVscodeTheme(json) {
  if (json.colors) {
    if (json.colors["editor.background"]) state.background = json.colors["editor.background"];
    if (json.colors["editor.foreground"]) state.foreground = json.colors["editor.foreground"];
  }

  if (json.tokenColors) {
    for (const entry of json.tokenColors) {
      const scopes = Array.isArray(entry.scope) ? entry.scope : [entry.scope];
      const fg = entry.settings?.foreground;
      if (!fg) continue;
      for (const scope of scopes) {
        const catId = tmScopeToCategoryId.get(scope);
        if (catId) {
          state[catId] = fg;
          const fs = entry.settings?.fontStyle || "";
          styleState[catId] = {
            bold: fs.includes("bold"),
            italic: fs.includes("italic"),
          };
          break;
        }
      }
    }
  }

  if (json.name) {
    document.getElementById("theme-name").value = json.name;
  }
}

function loadPandocTheme(json) {
  if (json["text-color"]) state.foreground = json["text-color"];
  if (json["background-color"]) state.background = json["background-color"];

  const textStyles = json["text-styles"];
  if (textStyles) {
    const seen = new Set();
    for (const [tokKey, style] of Object.entries(textStyles)) {
      const catId = pandocTokenToCategoryId.get(tokKey);
      if (catId && !seen.has(catId) && style["text-color"]) {
        state[catId] = style["text-color"];
        styleState[catId] = {
          bold: !!style["bold"],
          italic: !!style["italic"],
        };
        seen.add(catId);
      }
    }
  }

  if (json.metadata?.name) {
    document.getElementById("theme-name").value = json.metadata.name;
  }
}

function loadTmTheme(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const dicts = doc.querySelectorAll("plist > dict > array > dict");

  for (const dict of dicts) {
    const keys = dict.querySelectorAll(":scope > key");
    const keyMap = {};
    for (const key of keys) {
      keyMap[key.textContent] = key.nextElementSibling;
    }

    if (keyMap["scope"]) {
      const scopeStr = keyMap["scope"].textContent;
      const scopes = scopeStr.split(",").map((s) => s.trim());
      const settingsDict = keyMap["settings"];
      const fg = extractPlistDictValue(settingsDict, "foreground");
      if (!fg) continue;
      const fs = extractPlistDictValue(settingsDict, "fontStyle") || "";
      for (const scope of scopes) {
        const catId = tmScopeToCategoryId.get(scope);
        if (catId) {
          state[catId] = fg;
          styleState[catId] = {
            bold: fs.includes("bold"),
            italic: fs.includes("italic"),
          };
          break;
        }
      }
    } else if (keyMap["settings"]) {
      const settingsDict = keyMap["settings"];
      const bg = extractPlistDictValue(settingsDict, "background");
      const fg = extractPlistDictValue(settingsDict, "foreground");
      if (bg) state.background = bg;
      if (fg) state.foreground = fg;
    }
  }

  const nameKey = doc.querySelector("plist > dict > key");
  if (nameKey?.textContent === "name") {
    const nameVal = nameKey.nextElementSibling?.textContent;
    if (nameVal) document.getElementById("theme-name").value = nameVal;
  }
}

function extractPlistDictValue(dictEl, keyName) {
  const keys = dictEl.querySelectorAll(":scope > key");
  for (const key of keys) {
    if (key.textContent === keyName) {
      return key.nextElementSibling?.textContent || null;
    }
  }
  return null;
}

function loadThemeFromFile(filename, content) {
  if (filename.endsWith(".tmTheme")) {
    loadTmTheme(content);
  } else {
    const json = JSON.parse(content);
    if (json["text-styles"]) {
      loadPandocTheme(json);
    } else {
      loadVscodeTheme(json);
    }
  }
}

// --- Rendering ---

async function renderPreview() {
  const html = await codeToHtml(CODE_SAMPLE, {
    lang: "python",
    theme: buildShikiTheme(),
  });
  document.getElementById("preview").innerHTML = html;
}

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  const globalLabel = document.createElement("div");
  globalLabel.className = "section-label";
  globalLabel.textContent = "Global";
  sidebar.appendChild(globalLabel);

  for (const setting of GLOBAL_SETTINGS) {
    sidebar.appendChild(createTokenRow(setting.id, setting.label));
  }

  const tokenLabel = document.createElement("div");
  tokenLabel.className = "section-label";
  tokenLabel.textContent = "Tokens";
  sidebar.appendChild(tokenLabel);

  for (const cat of TOKEN_CATEGORIES) {
    sidebar.appendChild(createTokenRow(cat.id, cat.label));
  }
}

function createTokenRow(id, label) {
  const row = document.createElement("div");
  row.className = "token-row";

  const labelEl = document.createElement("span");
  labelEl.className = "token-label";
  labelEl.textContent = label;

  const btn = document.createElement("button");
  btn.className = "color-btn";
  btn.style.backgroundColor = state[id];
  btn.dataset.targetId = id;
  btn.addEventListener("click", (e) => openPopover(e, id));

  const nameEl = document.createElement("span");
  nameEl.className = "color-name";
  nameEl.id = `name-${id}`;
  nameEl.textContent = colorName(state[id]);

  row.appendChild(labelEl);
  row.appendChild(btn);

  if (styleState[id]) {
    const toggles = document.createElement("div");
    toggles.className = "style-toggles";

    const boldBtn = document.createElement("button");
    boldBtn.className = "style-toggle style-toggle-bold";
    if (styleState[id].bold) boldBtn.classList.add("active");
    boldBtn.textContent = "B";
    boldBtn.addEventListener("click", () => {
      styleState[id].bold = !styleState[id].bold;
      boldBtn.classList.toggle("active");
      renderPreview();
    });

    const italicBtn = document.createElement("button");
    italicBtn.className = "style-toggle style-toggle-italic";
    if (styleState[id].italic) italicBtn.classList.add("active");
    italicBtn.textContent = "I";
    italicBtn.addEventListener("click", () => {
      styleState[id].italic = !styleState[id].italic;
      italicBtn.classList.toggle("active");
      renderPreview();
    });

    toggles.appendChild(boldBtn);
    toggles.appendChild(italicBtn);
    row.appendChild(toggles);
  }

  row.appendChild(nameEl);
  return row;
}

// --- Popover ---

function openPopover(e, targetId) {
  const popover = document.getElementById("popover");

  if (activePopoverTarget === targetId) {
    closePopover();
    return;
  }

  activePopoverTarget = targetId;
  popover.innerHTML = "";

  for (const [groupName, colors] of Object.entries(PALETTE)) {
    const groupLabel = document.createElement("div");
    groupLabel.className = "palette-group-label";
    groupLabel.textContent = groupName;
    popover.appendChild(groupLabel);

    const grid = document.createElement("div");
    grid.className = "palette-grid";

    for (const color of colors) {
      const swatch = document.createElement("button");
      swatch.className = "swatch";
      if (color.hex.toUpperCase() === state[targetId].toUpperCase()) {
        swatch.classList.add("selected");
      }
      swatch.style.backgroundColor = color.hex;
      swatch.dataset.tooltip = `${color.name} (${color.hex})`;
      swatch.addEventListener("click", () => selectColor(targetId, color.hex));
      grid.appendChild(swatch);
    }

    popover.appendChild(grid);
  }

  const customRow = document.createElement("div");
  customRow.className = "custom-color-row";

  const customInput = document.createElement("input");
  customInput.type = "color";
  customInput.className = "custom-color-input";
  customInput.value = state[targetId];
  customInput.addEventListener("input", (ev) => selectColor(targetId, ev.target.value));

  const customLabel = document.createElement("span");
  customLabel.className = "custom-color-label";
  customLabel.textContent = "Custom color";

  customRow.appendChild(customInput);
  customRow.appendChild(customLabel);
  popover.appendChild(customRow);

  const btnRect = e.currentTarget.getBoundingClientRect();
  popover.style.top = `${btnRect.bottom + 6}px`;
  popover.style.left = `${btnRect.left}px`;
  popover.classList.add("open");
}

function closePopover() {
  document.getElementById("popover").classList.remove("open");
  activePopoverTarget = null;
}

function selectColor(targetId, hex) {
  state[targetId] = hex;

  const btn = document.querySelector(`[data-target-id="${targetId}"]`);
  btn.style.backgroundColor = hex;

  const nameEl = document.getElementById(`name-${targetId}`);
  nameEl.textContent = colorName(hex);

  const popover = document.getElementById("popover");
  for (const swatch of popover.querySelectorAll(".swatch")) {
    const matches = swatch.style.backgroundColor === btn.style.backgroundColor;
    swatch.classList.toggle("selected", matches);
  }

  renderPreview();
}

document.addEventListener("click", (e) => {
  const popover = document.getElementById("popover");
  if (
    !popover.contains(e.target) &&
    !e.target.classList.contains("color-btn") &&
    e.target.type !== "color"
  ) {
    closePopover();
  }
});

// --- File export ---

async function exportZip() {
  const name = themeName();
  const zip = new JSZip();
  zip.file(`${name}.tmTheme`, buildTmTheme());
  zip.file(`${name}.theme`, buildPandocTheme());
  zip.file(`${name}-vscode.json`, buildVscodeTheme());
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Wiring ---

document.getElementById("export-zip").addEventListener("click", exportZip);

document.getElementById("load-btn").addEventListener("click", () => {
  document.getElementById("load-input").click();
});

document.getElementById("load-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.name.endsWith(".zip")) {
    const zip = await JSZip.loadAsync(file);
    const vsCodeFile = Object.keys(zip.files).find((f) => f.endsWith("-vscode.json"));
    const pandocFile = Object.keys(zip.files).find((f) => f.endsWith(".theme"));
    const tmFile = Object.keys(zip.files).find((f) => f.endsWith(".tmTheme"));
    const preferred = vsCodeFile || pandocFile || tmFile;
    if (preferred) {
      const content = await zip.files[preferred].async("string");
      loadThemeFromFile(preferred, content);
    }
  } else {
    const content = await file.text();
    loadThemeFromFile(file.name, content);
  }

  renderSidebar();
  renderPreview();
  e.target.value = "";
});

renderSidebar();
renderPreview();
