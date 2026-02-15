import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ramadan-black/70 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Brand Logo/Name */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 group-hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logo-fool.png.jpeg" 
                  alt="Tablyet Fool Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-brand-beige tracking-wide group-hover:text-accent-yellow transition-colors duration-300">
                Tablyet Fool
              </span>
            </Link>
          </div>

          {/* Right Side: Yalla Ramadan */}
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-brand-beige">
                <div className="relative w-12 h-12">
                    <Image 
                        src="/logo-ramadan.png" 
                        alt="Ramadan Crescent" 
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="font-semibold text-lg tracking-wider">Yalla Ramadan</span>
             </div>
             {/* Mobile Menu Button (Placeholder for future phases) */}
             <div className="md:hidden">
                 <button className="text-brand-beige p-2">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                     </svg>
                 </button>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
