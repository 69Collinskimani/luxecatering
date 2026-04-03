import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title:       "LuxeCatering — Premium Catering in Nairobi",
  description: "Premium catering services for weddings, corporate events, and celebrations in Nairobi, Kenya.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}