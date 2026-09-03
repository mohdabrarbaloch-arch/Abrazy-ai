import "./globals.css";

export const metadata = { 
  title: "Abrazy.ai - Your AI Command Center", 
  description: "Advanced AI agents with prompt enhancement studio - Built in Pakistan" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
