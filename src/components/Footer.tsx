const footerLinks = ['Home', 'Devotional', 'Prayer Room', 'Bible Plan', 'Shop'];

export default function Footer() {
  return (
    <footer style={{ background: '#0F0A04' }} className="pt-20 pb-10">
      {/* Top decorative line */}
      <div className="h-px mb-16 opacity-40"
      style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
      

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto px-8 mb-16">
        {/* Col 1 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
              <path d="M5 0V14M1 4H9" stroke="#C9A84C" strokeWidth="1.5" />
            </svg>
            <span className="font-serif font-semibold text-xl tracking-wide" style={{ color: '#FDFAF5' }}>
              CrossAlliance
            </span>
          </div>
          <p className="font-sans text-sm mb-6" style={{ color: '#4A4035' }}>
            Walk in Faith, Together.
          </p>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) =>
            <svg key={i} width="8" height="12" viewBox="0 0 8 12" fill="none">
                <path d="M4 0V12M0 3.5H8" stroke="#C9A84C" strokeWidth="1" opacity="0.5" />
              </svg>
            )}
          </div>
          <a href="https://www.instagram.com/crossalliance/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
            <img src="https://res.cloudinary.com/dzqggd3t5/image/upload/v1772843297/instagram-application-logo_23-2151544088_ub4pk9.jpg" width="24px" height="24px" className="rounded-md opacity-60 hover:opacity-100 transition-opacity duration-200" alt="Instagram" />
          </a>
        </div>

        {/* Col 2 */}
        <div>
          <span className="block font-sans text-xs uppercase tracking-[0.2em] text-gold mb-5">Explore</span>
          <div className="flex flex-col gap-3">
            {footerLinks.map((link) =>
            <a
              key={link}
              href={`/${link.toLowerCase().replace(' ', '-')}`}
              className="nav-link inline-block w-fit font-sans text-sm transition-colors duration-200 hover:text-parchment"
              style={{ color: '#4A4035' }}>
              
                {link}
              </a>
            )}
          </div>
        </div>

        {/* Col 3 */}
        <div>
          <span className="block font-sans text-xs uppercase tracking-[0.2em] text-gold mb-5">About</span>
          <p className="font-sans text-sm leading-relaxed" style={{ color: '#4A4035' }}>
            CrossAlliance is built to glorify God and serve His people worldwide. Every feature is crafted
            with prayer and purpose.
          </p>

          {/* Ko-fi Support */}
          <div className="mt-6">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 0V14M2 5H12" stroke="#C9A84C" strokeWidth="1.5" />
            </svg>
            <p className="font-sans text-xs leading-relaxed mt-2 mb-4 max-w-[200px]" style={{ color: '#4A4035' }}>
              CrossAlliance is free for everyone. If this platform has blessed you, consider supporting our mission.
            </p>
            {/* TODO: Replace yourname with actual Ko-fi username */}
            <a
              href="https://ko-fi.com/yourname"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-sans uppercase tracking-[0.2em] transition-all duration-200"
              style={{ border: '1px solid #C9A84C', color: '#C9A84C', padding: '8px 20px', fontSize: '10px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C9A84C'; }}
            >
              Support This Ministry
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t pt-8 text-center" style={{ borderColor: '#1A1209' }}>
        <p className="font-sans text-xs" style={{ color: '#2A2018' }}>
          © 2026 CrossAlliance. All rights reserved. Built to glorify God.
        </p>
      </div>
    </footer>);

}