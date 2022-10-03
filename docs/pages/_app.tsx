import { injectGlobalStyles, Theme, ToastsProvider } from "@artsy/palette";
import type { AppProps } from "next/app";

const { GlobalStyles } = injectGlobalStyles();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // @ts-ignore
    <Theme theme="v3">
      <GlobalStyles />

      {/* @ts-ignore */}
      <ToastsProvider>
        <Component {...pageProps} />
      </ToastsProvider>
    </Theme>
  );
}

export default MyApp;
