import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { PublisherS3 } from "@electron-forge/publisher-s3";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerPKG } from "@electron-forge/maker-pkg";
import path from "path";

const config: ForgeConfig = {
  packagerConfig: {
    icon: path.resolve(__dirname, "icon"),
    appBundleId: "top.sipt.ChatHarvest",
    asar: true,
    buildVersion: "19",
    extendInfo: {
      ITSAppUsesNonExemptEncryption: false,
    },
    ignore: (file) => {
      if (!file) return false;
      if ("/node_modules" === file || "\\node_modules" === file) return false;

      return (
        !/^[/\\]package.json$/.test(file) &&
        !/^[/\\]\.vite($|[/\\]).*$/.test(file) &&
        !/^[/\\]node_modules[/\\]electron-squirrel-startup($|[/\\]).*$/.test(
          file,
        )
      );
    },
    osxSign: {},
    osxNotarize: {
      appleId: process.env.APPLE_APP_ID,
      appleIdPassword: process.env.APPLE_APP_PWD,
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel((arch) => ({
      // Note that we must provide this S3 URL here
      // in order to generate delta updates
      // remoteReleases: `https://apps.sipt.top/bubble/releases/win32/${arch}`,
      setupIcon: path.resolve(__dirname, "setup_icon.ico"),
    })),
    new MakerZIP(
      (arch) => ({
        // Note that we must provide this S3 URL here
        // in order to support smooth version transitions
        // especially when using a CDN to front your updates
        macUpdateManifestBaseUrl: `https://apps.sipt.top/bubble/releases/darwin/${arch}`,
      }),
      ["darwin"],
    ),
    new MakerRpm({}),
    new MakerDeb({}),
    new MakerPKG(
      {
        identity: "3rd Party Mac Developer Installer: XINYAN WU (34D4U5A5CW)",
      },
      ["mas"],
    ),
    new MakerDMG(
      {
        name: "ChatHarvest",
        icon: path.resolve(__dirname, "dmg_icon.icns"),
        background: path.resolve(__dirname, "background.png"),
        format: "ULFO",
        overwrite: true,
        additionalDMGOptions: {
          window: {
            size: {
              width: 600,
              height: 383,
            },
          },
        },
        contents: (opts: any) => {
          return [
            {
              x: 150,
              y: 163,
              type: "file",
              path: opts.appPath,
            },
            {
              x: 458,
              y: 163,
              type: "link",
              path: "/Applications",
            },
          ];
        },
      },
      ["darwin"],
    ),
  ],
  publishers: [
    new PublisherS3(
      {
        region: "us-east-1",
        bucket: "apps",
        endpoint:
          "https://1b8fcd7615361c9d624e99c34ce729d1.r2.cloudflarestorage.com",
        folder: "bubble",
      },
      ["darwin"],
    ),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
  ],
};

export default config;
