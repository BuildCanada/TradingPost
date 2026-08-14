import Script from "next/script";

/* X (Twitter) Ads universal website tag. `twq('config', <pixel id>)` loads the
   tag and reports the initial page load; conversion events are then reported
   with twq('event', 'tw-<pixel>-<event>', {...}) from wherever they happen.

   Production only, so localhost and preview deployments stay out of the ad
   data. To check the tag locally, temporarily drop the NODE_ENV guard. */

const X_PIXEL_ID = "re2t6";

export function XPixel() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Script id="x-pixel" strategy="afterInteractive">
      {`
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
        twq('config','${X_PIXEL_ID}');
      `}
    </Script>
  );
}
