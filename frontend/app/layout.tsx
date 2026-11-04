import "./globals.css";
import SessionWrapper from "../components/SessionWrapper";
import GoogleOAuthWrapper from "../components/GoogleOAuthWrapper";

export const metadata = { 
  title: "Abrazy.ai - Your AI Command Center", 
  description: "Advanced AI agents with prompt enhancement studio - Built in Pakistan" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionWrapper>
          <GoogleOAuthWrapper>
            {children}
          </GoogleOAuthWrapper>
        </SessionWrapper>
      </body>
    </html>
  );
}
