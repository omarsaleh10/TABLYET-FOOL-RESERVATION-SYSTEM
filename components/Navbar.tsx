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
              <div className="relative w-8 h-8 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                <Image 
                  src="/logo-fool.png.jpeg" 
                  alt="Tablyet Fool Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-brand-beige tracking-wide group-hover:text-brand-orange transition-colors duration-300 shadow-sm">
                Tablyet Fool
              </span>
            </Link>
          </div>

          {/* Right Side: Yalla Ramadan */}
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-brand-beige group cursor-pointer">
                <div className="relative w-12 h-12 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 drop-shadow-md">
                    <Image 
                        src="/logo-ramadan.png" 
                        alt="Ramadan Crescent" 
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="font-semibold text-lg tracking-wider group-hover:text-brand-orange transition-colors duration-300">Yalla Ramadan</span>
             </div>
             {/* Mobile Menu Button */}
             <div className="md:hidden">
                 <button className="text-brand-beige p-2 hover:bg-white/10 rounded-full transition-colors">
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
