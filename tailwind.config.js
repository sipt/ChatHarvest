/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      icon: ["icon-font"],
      emoji: ["fluentui-emoji"],
    },
    fontSize: {
      sm: "0.6875rem",
      base: "0.8125rem",
      xl: "1rem",
    },
    extend: {
      keyframes: {
        dotFlashing: {
          "0%, 100%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.0)" },
        },
      },
      animation: {
        dotFlashing: "dotFlashing 1.4s infinite ease-in-out both",
      },
      transitionProperty: {
        height: "height",
      },
      colors: {
        // 主题色
        theme: {
          light: "#AF52DE",
          dark: "#BF5AF2",
        },
        // 主字体颜色
        primary: {
          light: "#000000",
          dark: "#DDDDDD",
        },
        // 次要字体颜色
        secondary: {
          light: "#575757",
          dark: "#BEBEBE",
        },
        // 边框颜色
        border: {
          light: "#D3D3D3",
          dark: "#4F4F4F",
        },
        // 高亮色
        highlight: {
          light: "#FFD700",
          dark: "#FFA500",
        },
        // 背景色
        background: {
          light: "#FFFFFF",
          dark: "#1E1E1E",
        },
        sider: {
          light: "#FFFFFF",
          dark: "#333333",
        },
        // 对话泡泡颜色
        bubble: {
          receive: {
            light: "#E9E9EB",
            dark: "#3B3B3D",
          },
          send: {
            light: "#AF52DE",
            dark: "#BF5AF2",
          },
        },
        // 提示文字颜色
        placeholder: {
          light: "#9A9A9A",
          dark: "#767676",
        },
        // 链接颜色
        link: {
          light: "#0000EE",
          dark: "#599BFF",
        },
        // 错误提示颜色
        error: {
          light: "#D32F2F",
          dark: "#F44336",
        },
        // 成功提示颜色
        success: {
          light: "#388E3C",
          dark: "#4CAF50",
        },
        // 图标颜色
        icon: {
          light: "#757575",
          dark: "#C0C0C0",
        },
        // 分隔线颜色
        divider: {
          light: "#E0E0E0",
          dark: "#373737",
        },
        input: {
          bg: {
            light: "#FFFFFF",
            dark: "#3C3B3B",
          },
        },
        sash: {
          light: "#C1C1C1",
          dark: "#000000",
        },
        // 阴影色
        shadow: {
          light: "#D1D1D1", // 在配置中，阴影通常需要通过 boxShadow 属性设置
          dark: "#000000", // 阴影色通常需要设置透明度，如 rgba(0, 0, 0, 0.5)
        },
        button: {
          normal: {
            light: "#FFFFFF",
            dark: "#656565",
          },
          active: {
            light: "#F0F0F0",
            dark: "#7c7b7b",
          },
        },
        // toolbar
        toolbar: {
          bg: {
            light: "#F0F0F0",
            dark: "#373839",
          },
          button: {
            hover: {
              light: "#E1E2E3",
              dark: "#444546",
            },
            active: {
              light: "#D5D6D6",
              dark: "#525252",
            },
          },
          divider: {
            light: "#D3D3D3",
            dark: "#101010",
          },
        },
        control: {
          bg: {
            light: "#ECECEC",
            dark: "#292929",
          },
          // 按钮颜色
          button: {
            normal: {
              light: "#FFFFFF",
              dark: "#5F5F5F",
            },
            active: {
              light: "#F0F0F0",
              dark: "#767676",
            },
            border: {
              light: "#C4C4C4",
              dark: "#232323",
            },
          },
        },
        box: {
          bg: {
            light: "#E5E5E5",
            dark: "#303030",
          },
          border: {
            light: "#FFFFFF",
            dark: "#666666",
          },
        },
        list: {
          select: {
            light: "#73307A",
            dark: "#77397E",
          },
        },
        popover: {
          bg: {
            light: "#FFFFFF",
            dark: "#252525",
          },
        },
        tab: {
          bg: {
            light: "#E0E0E0",
            dark: "#343434",
          },
          active: {
            light: "#FFFFFF",
            dark: "#666666",
          },
          shadow: {
            light: "#E0E0E0",
            dark: "#484848",
          },
          divider: {
            light: "#C9C9C9",
            dark: "#2C2C2C",
          },
        },
        slider: {
          thumb: {
            normal: {
              light: "#FFFFFF",
              dark: "#949393",
            },
            active: {
              light: "#F0F0F0",
              dark: "#ADACAC",
            },
          },
          track: {
            light: "#EEEEEE",
            dark: "#3E3C3C",
          },
        },
      },
    },
  },
  plugins: [],
};
