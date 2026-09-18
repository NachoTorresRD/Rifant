import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveActivityToast from '@/components/LiveActivityToast';

export const metadata: Metadata = {
  title: 'RifaNT | Plataforma Moderna de Rifas y Sorteos Digitales',
  description: 'Participa y crea sorteos transparentes de vehículos, tecnología, celulares y dinero en efectivo. Elige tus números de la suerte fácilmente desde tu celular.',
  keywords: ['rifas', 'sorteos', 'loteria digital', 'iphone', 'premios', 'republica dominicana'],
  openGraph: {
    title: 'RifaNT - Sorteos y Rifas Digitales',
    description: 'Participa en sorteos activos y compra tus números fácilmente por WhatsApp.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <LiveActivityToast />
      </body>
    </html>
  );
}

