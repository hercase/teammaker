import React from "react";
import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";

import "/src/app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f5f5f5" },
        { name: "dark", value: "#151d65" },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md mx-auto">
        <Story />{" "}
      </div>
    ),
    withThemeByClassName({ themes: { light: "", dark: "dark" }, defaultTheme: "light" }),
  ],
};

export default preview;
