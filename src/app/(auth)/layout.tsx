import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Eventrix",
            "url": "https://sona-eventrix-itads.vercel.app/",
            "description": "Eventrix is the premier event management and discovery platform for Sona College of Technology. Register for college events, hackathons, and technical symposiums.",
            "publisher": {
              "@type": "Organization",
              "name": "Sona College of Technology",
              "url": "https://www.sonatech.ac.in/",
              "logo": {
                "@type": "ImageObject",
                "url": "https://sona-eventrix-itads.vercel.app/assets/Eventrix%20logo.svg"
              }
            }
          })
        }}
      />
      <div className="auth-page w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-white">
        {children}
      </div>
    </>
  );
}

