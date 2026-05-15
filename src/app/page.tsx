import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f0a0a]">
      {/* Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-leather.png")' }} />
      
      {/* Warm Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-heritage-red/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-heritage-ochre/10 blur-[150px] rounded-full" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="text-3xl font-display font-bold tracking-widest text-heritage-ochre">BHULIA</div>
        <div className="hidden md:flex gap-10 text-sm font-medium tracking-[0.2em] uppercase text-white/60">
          <a href="#" className="hover:text-heritage-ochre transition-colors">The Weaver's Story</a>
          <a href="#" className="hover:text-heritage-ochre transition-colors">Silk Collection</a>
          <a href="#" className="hover:text-heritage-ochre transition-colors">Cotton Ikat</a>
        </div>
        <button className="text-xs font-bold tracking-widest uppercase border-b border-heritage-ochre pb-1 text-heritage-ochre hover:text-white hover:border-white transition-all">
          Explore Heritage
        </button>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-12 pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-heritage-ochre" />
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-heritage-ochre">Sambalpur, Odisha</span>
            </div>
            
            <h1 className="text-7xl lg:text-8xl font-display leading-tight mb-8">
              Artistry <br />
              <span className="bhulia-gradient-text italic">In Every Thread.</span>
            </h1>
            
            <p className="text-lg text-white/50 leading-relaxed max-w-lg mb-12">
              Discover the soul of Odisha through our curated collection of 
              authentic Sambalpuri handloom. Every piece is a masterpiece of 
              ancient Ikat techniques, hand-woven by master craftsmen.
            </p>
            
            <div className="flex flex-wrap gap-8">
              <button className="bhulia-button">
                Shop Collection
              </button>
              <div className="flex flex-col">
                <span className="text-2xl font-display text-white">400+</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Master Weavers</span>
              </div>
            </div>
          </div>

          {/* Saree Image Container */}
          <div className="relative group">
            <div className="absolute -inset-4 border border-heritage-ochre/20 rounded-lg -rotate-2 group-hover:rotate-0 transition-all duration-700" />
            <div className="absolute -inset-4 border border-heritage-red/20 rounded-lg rotate-2 group-hover:rotate-0 transition-all duration-700" />
            <div className="relative overflow-hidden rounded-sm shadow-2xl">
              <Image 
                src="/bhulia-hero.png" 
                alt="Premium Sambalpuri Saree" 
                width={800} 
                height={1000} 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-8 left-8 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-heritage-ochre mb-2">Signature Piece</p>
                <h3 className="text-2xl font-display text-white">Crimson Ikat Silk</h3>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Heritage Bar */}
      <div className="bg-[#1a1110] py-16 border-y border-heritage-red/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-heritage-ochre text-sm font-bold tracking-widest uppercase mb-2">Technique</p>
              <p className="text-white text-lg font-display">Double Ikat</p>
            </div>
            <div>
              <p className="text-heritage-ochre text-sm font-bold tracking-widest uppercase mb-2">Material</p>
              <p className="text-white text-lg font-display">Mulberry Silk</p>
            </div>
            <div>
              <p className="text-heritage-ochre text-sm font-bold tracking-widest uppercase mb-2">Legacy</p>
              <p className="text-white text-lg font-display">800 Years</p>
            </div>
            <div>
              <p className="text-heritage-ochre text-sm font-bold tracking-widest uppercase mb-2">Origin</p>
              <p className="text-white text-lg font-display">Odisha, India</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
