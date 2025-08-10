import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const hasTitle = searchParams.has("title");
    const hasSubtitle = searchParams.has("subtitle");
    const title = hasTitle ? searchParams.get("title")?.slice(0, 100) : "Mensaje de prueba";
    const subtitle = hasSubtitle ? searchParams.get("subtitle")?.slice(0, 100) : "Subtítulo de prueba";

    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full items-center bg-gray-50 p-12">
          <svg xmlns="http://www.w3.org/2000/svg" width="200" viewBox="0 0 569 75" fill="none">
            <path
              d="M0.881854 1.76229V16.1471H18.6724V74H33.2365V16.1471H50.9822V1.76229H0.881854ZM57.2559 1.58304V74.0896H100.814V59.66H71.7752V45.096H93.5541V30.6215H71.7752V16.0575H100.814V1.58304H57.2559ZM104.399 74H120.083L124.968 63.0209H149.704L154.589 74H170.318L137.336 0.28348L104.399 74ZM130.704 50.2046L137.381 34.9235L143.968 50.2046H130.704ZM176.636 0.0594172V74H191.156V44.0653L212.038 72.8349L232.876 44.0653V74H247.395V0.0594172L212.038 48.5913L176.636 0.0594172ZM256.403 0.0594172V74H270.922V44.0653L291.804 72.8349L312.642 44.0653V74H327.161V0.0594172L291.804 48.5913L256.403 0.0594172ZM333.48 74H349.164L354.049 63.0209H378.785L383.67 74H399.399L366.417 0.28348L333.48 74ZM359.785 50.2046L366.462 34.9235L373.049 50.2046H359.785ZM405.718 1.76229V74H420.192V43.7068L441.254 74H458.91L434.084 38.4637L455.46 1.76229H438.7L420.192 33.7136V1.76229H405.718ZM465.229 1.58304V74.0896H508.786V59.66H479.748V45.096H501.527V30.6215H479.748V16.0575H508.786V1.58304H465.229ZM515.06 74H529.579V42.0487L550.328 74H568.073L551.269 47.8295C555.391 46.2163 557.408 44.7375 559.917 41.1525C562.965 36.8505 564.488 32.2796 564.488 27.395V25.5129C564.488 17.5363 561.934 13.548 557.542 9.11154C553.151 4.80954 546.653 1.76229 538.632 1.76229H515.06V74ZM540.021 36.1335H535.181V36.0886H529.579V16.1471H537.735C541.231 16.1471 544.771 17.2226 546.698 19.0151C548.58 21.0317 549.566 23.3619 549.566 26.0058C549.566 31.473 545.309 36.1335 540.021 36.1335Z"
              fill="#1A1E4E"
            />
          </svg>
          <div tw="flex w-full">
            <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
              <h2 tw="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">
                <span>{title}</span>
                <span tw="text-indigo-600">{subtitle}</span>
              </h2>
            </div>
          </div>
        </div>
      ),
      {
        width: 500,
        height: 600,
      }
    );
  } catch (e) {
    if (e instanceof Error) {
      console.log(`${e.message}`);
      return new Response(`Failed to generate the image`, {
        status: 500,
      });
    }
  }
}
