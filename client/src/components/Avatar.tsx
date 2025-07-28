/**
 * Avatar.tsx
 * 
 * Sistema de avatares SVG para o site da psicóloga
 * Contém: Avatar principal detalhado e avatares para testimoniais
 * Inclui instruções para substituição por fotos PNG reais
 */

// Interface para definir propriedades do avatar principal
interface AvatarProps {
  size?: 'sm' | 'md' | 'lg'; // Tamanhos disponíveis
  className?: string; // Classes CSS adicionais
  customImage?: string; // URL da imagem personalizada
}

// Componente principal do avatar da psicóloga
export function Avatar({ size = 'md', className = '', customImage }: AvatarProps) {
  // Mapeamento de tamanhos para classes CSS
  const sizeClasses = {
    sm: 'w-12 h-14',    // Pequeno: para header/footer
    md: 'w-56 h-64',    // Médio: para hero section
    lg: 'w-64 h-72'     // Grande: para destaque especial
  };

  // Se há uma imagem personalizada, exibe ela em vez do SVG
  if (customImage) {
    return (
      <div className={`relative ${className}`}>
        <img 
          src={customImage} 
          alt="Dra. Adrielle Benhossi" 
          className={`${sizeClasses[size]} rounded-2xl object-cover shadow-xl border-4 border-white`}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* SVG do avatar com viewBox responsivo */}
      <svg viewBox="0 0 240 300" className={sizeClasses[size]}>
        {/* Fundo branco semi-transparente */}
        <rect x="0" y="0" width="240" height="300" rx="20" fill="#ffffff" opacity="0.9"/>

        {/* Cabelo - parte superior ajustada */}
        <ellipse cx="120" cy="92" rx="36" ry="15" fill="#3e2723"/>

        {/* Cabelo lateral esquerdo */}
        <ellipse cx="85" cy="155" rx="10" ry="65" fill="#3e2723"/>

        {/* Cabelo lateral direito */}
        <ellipse cx="155" cy="155" rx="10" ry="65" fill="#3e2723"/>

        {/* Mechas loiras sutis no avatar principal */}
        <ellipse cx="88" cy="145" rx="3" ry="30" fill="#d4af37"/>
        <ellipse cx="152" cy="145" rx="3" ry="30" fill="#d4af37"/>
        <ellipse cx="110" cy="95" rx="2" ry="12" fill="#daa520"/>
        <ellipse cx="130" cy="95" rx="2" ry="12" fill="#daa520"/>
        <ellipse cx="102" cy="140" rx="2" ry="18" fill="#b8860b"/>
        <ellipse cx="138" cy="140" rx="2" ry="18" fill="#b8860b"/>

        {/* Rosto mais fofo com testa maior */}
        <ellipse cx="120" cy="125" rx="35" ry="40" fill="#ffe0b8"/>

        {/* Olhos grandes e meigos */}
        <circle cx="105" cy="115" r="9" fill="#2c1810"/>
        <circle cx="135" cy="115" r="9" fill="#2c1810"/>
        <circle cx="107" cy="112" r="3" fill="#ffffff"/>
        <circle cx="137" cy="112" r="3" fill="#ffffff"/>
        <circle cx="105" cy="117" r="1" fill="#ffffff"/>
        <circle cx="135" cy="117" r="1" fill="#ffffff"/>

        {/* Cílios suaves */}
        <path d="M 96 114 L 94 111" stroke="#2c1810" strokeWidth="1"/>
        <path d="M 105 113 L 105 110" stroke="#2c1810" strokeWidth="1"/>
        <path d="M 114 114 L 116 111" stroke="#2c1810" strokeWidth="1"/>
        <path d="M 126 114 L 124 111" stroke="#2c1810" strokeWidth="1"/>
        <path d="M 135 113 L 135 110" stroke="#2c1810" strokeWidth="1"/>
        <path d="M 144 114 L 146 111" stroke="#2c1810" strokeWidth="1"/>

        {/* Sobrancelhas suaves e meigos */}
        <ellipse cx="105" cy="105" rx="9" ry="2" fill="#3e2723"/>
        <ellipse cx="135" cy="105" rx="9" ry="2" fill="#3e2723"/>

        {/* Nariz pequeno e fofo */}
        <circle cx="120" cy="125" r="2" fill="#ffb87a"/>

        {/* Boca pequena e meiga */}
        <ellipse cx="120" cy="140" rx="6" ry="3" fill="#ff6b6b"/>
        <ellipse cx="120" cy="139" rx="4" ry="1.5" fill="#fab1a0"/>

        {/* Blush fofo */}
        <circle cx="92" cy="130" r="8" fill="#ff8a80" opacity="0.5"/>
        <circle cx="148" cy="130" r="8" fill="#ff8a80" opacity="0.5"/>

        {/* Pescoço conectado */}
        <ellipse cx="120" cy="168" rx="12" ry="8" fill="#ffe0b8"/>
        <path d="M 108 172 Q 120 170 132 172" stroke="#ffb87a" strokeWidth="0.5" fill="none"/>

        {/* Corpo conectado ao pescoço */}
        <ellipse cx="120" cy="215" rx="35" ry="45" fill="#ffe0b8"/>

        {/* Seios mais integrados */}
        <ellipse cx="108" cy="190" rx="14" ry="16" fill="#ffe0b8"/>
        <ellipse cx="132" cy="190" rx="14" ry="16" fill="#ffe0b8"/>

        {/* Linhas suaves dos seios */}
        <path d="M 96 198 Q 108 204 120 198" stroke="#ffb87a" strokeWidth="1" fill="none"/>
        <path d="M 120 198 Q 132 204 144 198" stroke="#ffb87a" strokeWidth="1" fill="none"/>

        {/* Cintura mais definida */}
        <ellipse cx="120" cy="235" rx="25" ry="20" fill="#ffe0b8"/>

        {/* Quadris mais largos */}
        <ellipse cx="120" cy="255" rx="32" ry="18" fill="#ffe0b8"/>

        {/* Roupa FARM subida com ombros arredondados */}
        <path d="M 90 180 Q 105 175 120 177 Q 135 175 150 180 Q 155 185 155 200 Q 158 210 155 225 L 155 270 Q 155 275 150 275 L 90 275 Q 85 275 85 270 L 85 225 Q 82 210 85 200 Q 85 185 90 180 Z" fill="#ffc107"/>

        {/* Decote em V mais elegante */}
        <path d="M 112 180 Q 120 190 128 180" fill="#ffe0b8"/>

        {/* Detalhes da roupa */}
        <path d="M 100 190 Q 120 188 140 190" stroke="#ffaa00" strokeWidth="1" fill="none"/>
        <path d="M 105 205 Q 120 203 135 205" stroke="#ffaa00" strokeWidth="0.5" fill="none"/>

        {/* Sombras na roupa para volume */}
        <ellipse cx="95" cy="220" rx="8" ry="15" fill="#e6ac00" opacity="0.3"/>
        <ellipse cx="145" cy="220" rx="8" ry="15" fill="#e6ac00" opacity="0.3"/>

        {/* Texto FARM */}
        <text x="120" y="225" fontSize="14" fill="#ffffff" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">FARM</text>

        {/* Brincos descidos */}
        <ellipse cx="83" cy="125" rx="2" ry="4" fill="#c0c0c0"/>
        <ellipse cx="157" cy="125" rx="2" ry="4" fill="#c0c0c0"/>
        <circle cx="83" cy="123" r="1.5" fill="#e0e0e0"/>
        <circle cx="157" cy="123" r="1.5" fill="#e0e0e0"/>

        {/* Braço esquerdo mais abaixado com manga amarela */}
        <ellipse cx="75" cy="215" rx="8" ry="25" fill="#ffe0b8"/>
        <ellipse cx="75" cy="190" rx="10" ry="15" fill="#ffc107"/>

        {/* Braço direito mais abaixado com manga amarela */}
        <ellipse cx="165" cy="215" rx="8" ry="25" fill="#ffe0b8"/>
        <ellipse cx="165" cy="190" rx="10" ry="15" fill="#ffc107"/>

        {/* Detalhes das mangas */}
        <path d="M 67 183 Q 75 181 83 183" stroke="#ffaa00" strokeWidth="0.5" fill="none"/>
        <path d="M 157 183 Q 165 181 173 183" stroke="#ffaa00" strokeWidth="0.5" fill="none"/>
      </svg>
    </div>
  );
}

// Componente para avatar de depoimento
interface TestimonialAvatarProps {
  gender: 'maria' | 'male' | 'couple' | 'childtherapy' | 'darthvader';
  className?: string;
}

export function TestimonialAvatar({ gender, className = '' }: TestimonialAvatarProps) {
  /*
    SUBSTITUIÇÃO POR PNG - TESTIMONIAIS:
    Para substituir por fotos PNG dos clientes, use:

    Para casal (João e Ana):
    <div className="flex -space-x-2">
      <img src="/joao.png" alt="João" className="w-8 h-8 rounded-full border-2 border-white" />
      <img src="/ana.png" alt="Ana" className="w-8 h-8 rounded-full border-2 border-white" />
    </div>

    Para Maria Silva (terapia individual):
    <img src="/maria.png" alt="Maria" className="w-16 h-16 rounded-full border-2 border-white/50" />

    Para Carla Mendes (terapia infantil):
    <img src="/carla.png" alt="Carla" className="w-16 h-16 rounded-full border-2 border-white/50" />
  */

  if (gender === 'couple') {
    // João e Ana Costa - Casal em terapia
    return (
      <div className={`relative ${className}`}>
        <svg viewBox="0 0 120 120" className="w-12 h-12">
          <circle cx="60" cy="60" r="58" fill="url(#coupleGradient)" opacity="0.9"/>
          <defs>
            <linearGradient id="coupleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e8f4f8"/>
              <stop offset="100%" stopColor="#fce4ec"/>
            </linearGradient>
          </defs>

          {/* João - homem adulto com barba */}
          <circle cx="42" cy="48" r="16" fill="#ffcc9c"/>
          <ellipse cx="42" cy="32" rx="14" ry="10" fill="#2c1810"/>
          <ellipse cx="42" cy="58" rx="8" ry="4" fill="#654321" opacity="0.7"/> {/* barba */}
          <circle cx="38" cy="44" r="2" fill="#2c1810"/>
          <circle cx="46" cy="44" r="2" fill="#2c1810"/>
          <ellipse cx="42" cy="50" rx="2" ry="3" fill="#ffb87a"/>
          <rect x="32" y="64" width="20" height="25" rx="4" fill="#1976d2"/>

          {/* Ana - mulher com cabelo longo */}
          <circle cx="78" cy="48" r="16" fill="#ffcc9c"/>
          <ellipse cx="78" cy="30" rx="16" ry="12" fill="#8d6e63"/>
          <ellipse cx="68" cy="52" rx="5" ry="18" fill="#8d6e63"/> {/* cabelo longo esquerda */}
          <ellipse cx="88" cy="52" rx="5" ry="18" fill="#8d6e63"/> {/* cabelo longo direita */}
          <circle cx="74" cy="44" r="2" fill="#2c1810"/>
          <circle cx="82" cy="44" r="2" fill="#2c1810"/>
          <ellipse cx="78" cy="50" rx="1.5" ry="2" fill="#ffb87a"/>
          <ellipse cx="78" cy="54" rx="3" ry="2" fill="#e91e63"/>
          <circle cx="70" cy="48" r="3" fill="#ff8a80" opacity="0.4"/> {/* blush */}
          <circle cx="86" cy="48" r="3" fill="#ff8a80" opacity="0.4"/>
          <rect x="68" y="64" width="20" height="25" rx="4" fill="#ad1457"/>
        </svg>
      </div>
    );
  }

  if (gender === 'male') {
    // Pai/Responsável masculino (testimonial de terapia infantil)
    return (
      <div className={`relative ${className}`}>
        <svg viewBox="0 0 120 120" className="w-12 h-12">
          <circle cx="60" cy="60" r="58" fill="#e8f4f8" opacity="0.9"/>

          {/* Cabelo masculino adulto */}
          <ellipse cx="60" cy="42" rx="28" ry="15" fill="#4a4a4a"/>
          <ellipse cx="60" cy="40" rx="24" ry="8" fill="#5a5a5a"/> {/* linha do cabelo */}

          {/* Rosto paterno */}
          <circle cx="60" cy="62" r="22" fill="#ffcc9c"/>

          {/* Óculos discretos */}
          <circle cx="52" cy="58" r="8" fill="none" stroke="#333" strokeWidth="1.5"/>
          <circle cx="68" cy="58" r="8" fill="none" stroke="#333" strokeWidth="1.5"/>
          <line x1="60" y1="56" x2="60" y2="58" stroke="#333" strokeWidth="1.5"/>

          {/* Olhos atrás dos óculos */}
          <circle cx="52" cy="58" r="2" fill="#2c1810"/>
          <circle cx="68" cy="58" r="2" fill="#2c1810"/>

          {/* Bigode discreto */}
          <ellipse cx="60" cy="68" rx="6" ry="2" fill="#4a4a4a" opacity="0.6"/>

          {/* Nariz */}
          <ellipse cx="60" cy="65" rx="2" ry="4" fill="#ffb87a"/>

          {/* Boca */}
          <ellipse cx="60" cy="72" rx="4" ry="2" fill="#d84315"/>

          {/* Camisa social */}
          <rect x="42" y="84" width="36" height="30" rx="6" fill="#1565c0"/>
          <line x1="60" y1="84" x2="60" y2="114" stroke="#0d47a1" strokeWidth="2"/>
        </svg>
      </div>
    );
  }

  if (gender === 'maria') {
    // Maria Silva - Jovem profissional com ansiedade
    return (
      <div className={`relative ${className}`}>
        <svg viewBox="0 0 120 120" className="w-12 h-12">
          <circle cx="60" cy="60" r="58" fill="#e8f5e8" opacity="0.9"/>

          {/* Cabelo curto e moderno */}
          <ellipse cx="60" cy="38" rx="30" ry="16" fill="#8d6e63"/>
          <ellipse cx="60" cy="42" rx="26" ry="12" fill="#a1887f"/> {/* camada superior */}
          <ellipse cx="45" cy="58" rx="6" ry="15" fill="#8d6e63"/> {/* lateral esquerda */}
          <ellipse cx="75" cy="58" rx="6" ry="15" fill="#8d6e63"/> {/* lateral direita */}

          {/* Rosto jovem */}
          <circle cx="60" cy="62" r="18" fill="#ffcc9c"/>

          {/* Olhos com expressão ansiosa mas esperançosa */}
          <ellipse cx="55" cy="58" rx="3" ry="4" fill="white"/>
          <ellipse cx="65" cy="58" rx="3" ry="4" fill="white"/>
          <circle cx="55" cy="58" r="2" fill="#4a4a4a"/>
          <circle cx="65" cy="58" r="2" fill="#4a4a4a"/>
          <circle cx="55" cy="57" r="0.5" fill="white"/>
          <circle cx="65" cy="57" r="0.5" fill="white"/>

          {/* Sobrancelhas levemente franzidas */}
          <ellipse cx="55" cy="54" rx="3" ry="1" fill="#6d4c41"/>
          <ellipse cx="65" cy="54" rx="3" ry="1" fill="#6d4c41"/>

          {/* Nariz pequeno */}
          <ellipse cx="60" cy="63" rx="1" ry="2" fill="#ffb87a"/>

          {/* Sorriso suave de alívio */}
          <ellipse cx="60" cy="70" rx="3" ry="1.5" fill="#e91e63"/>

          {/* Blush leve */}
          <circle cx="50" cy="65" r="3" fill="#ff8a80" opacity="0.25"/>
          <circle cx="70" cy="65" r="3" fill="#ff8a80" opacity="0.25"/>

          {/* Blusa profissional verde */}
          <rect x="44" y="80" width="32" height="30" rx="5" fill="#4caf50"/>
          <ellipse cx="60" cy="80" rx="6" ry="2" fill="#388e3c"/> {/* gola */}
        </svg>
      </div>
    );
  }

  if (gender === 'childtherapy') {
    // Carla Mendes - Mãe com ursinho (terapia infantil)
    return (
      <div className={`relative ${className}`}>
        <svg viewBox="0 0 120 120" className="w-12 h-12">
          <circle cx="60" cy="60" r="58" fill="#fff3e0" opacity="0.9"/>

          {/* Ursinho fofo no fundo */}
          <circle cx="85" cy="35" r="12" fill="#8d6e63" opacity="0.4"/>
          <circle cx="80" cy="30" r="4" fill="#6d4c41" opacity="0.4"/> {/* orelha */}
          <circle cx="90" cy="30" r="4" fill="#6d4c41" opacity="0.4"/> {/* orelha */}
          <circle cx="82" cy="33" r="1" fill="#333" opacity="0.6"/> {/* olho */}
          <circle cx="88" cy="33" r="1" fill="#333" opacity="0.6"/> {/* olho */}
          <ellipse cx="85" cy="37" rx="1.5" ry="1" fill="#333" opacity="0.6"/> {/* nariz */}

          {/* Cabelo maternal ondulado */}
          <ellipse cx="60" cy="40" rx="34" ry="20" fill="#a1887f"/>
          <ellipse cx="42" cy="60" rx="10" ry="22" fill="#a1887f"/>
          <ellipse cx="78" cy="60" rx="10" ry="22" fill="#a1887f"/>
          <ellipse cx="60" cy="38" rx="30" ry="15" fill="#bcaaa4"/> {/* ondas */}

          {/* Rosto maternal carinhoso */}
          <circle cx="60" cy="64" r="20" fill="#ffcc9c"/>

          {/* Olhos calorosos e maternais */}
          <ellipse cx="54" cy="60" rx="3" ry="4" fill="white"/>
          <ellipse cx="66" cy="60" rx="3" ry="4" fill="white"/>
          <circle cx="54" cy="60" r="2" fill="#5d4037"/>
          <circle cx="66" cy="60" r="2" fill="#5d4037"/>
          <circle cx="54" cy="59" r="0.5" fill="white"/>
          <circle cx="66" cy="59" r="0.5" fill="white"/>

          {/* Sobrancelhas maternais */}
          <ellipse cx="54" cy="56" rx="4" ry="1.5" fill="#8d6e63"/>
          <ellipse cx="66" cy="56" rx="4" ry="1.5" fill="#8d6e63"/>

          {/* Sorriso orgulhoso de mãe */}
          <ellipse cx="60" cy="72" rx="5" ry="2.5" fill="#e91e63"/>
          <ellipse cx="60" cy="71" rx="4" ry="1.5" fill="#f8bbd9"/>

          {/* Nariz maternal */}
          <ellipse cx="60" cy="66" rx="1.5" ry="3" fill="#ffb87a"/>

          {/* Blush de orgulho maternal */}
          <circle cx="48" cy="68" r="4" fill="#ff8a80" opacity="0.35"/>
          <circle cx="72" cy="68" r="4" fill="#ff8a80" opacity="0.35"/>

          {/* Blusa maternal rosa */}
          <rect x="42" y="84" width="36" height="30" rx="6" fill="#f48fb1"/>
          <ellipse cx="60" cy="84" rx="8" ry="3" fill="#e91e63"/>
        </svg>
      </div>
    );
  }

  if (gender === 'darthvader') {
    // Rafael Skywalker - Avatar Darth Vader mais reconhecível
    return (
      <div className={`relative ${className}`}>
        <svg viewBox="0 0 120 120" className="w-12 h-12">
          <circle cx="60" cy="60" r="58" fill="url(#vaderGradient)" opacity="0.95"/>
          <defs>
            <linearGradient id="vaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#000000"/>
              <stop offset="100%" stopColor="#1a1a1a"/>
            </linearGradient>
          </defs>

          {/* Capacete icônico triangular superior */}
          <path d="M 60 25 L 35 55 Q 35 40 60 40 Q 85 40 85 55 Z" fill="#1a1a1a"/>
          <ellipse cx="60" cy="50" rx="30" ry="30" fill="#0d0d0d"/>

          {/* Base da máscara triangular característica */}
          <path d="M 60 45 L 40 75 Q 45 85 60 85 Q 75 85 80 75 Z" fill="#2c2c2c"/>

          {/* Testa com reflexo */}
          <ellipse cx="60" cy="40" rx="25" ry="10" fill="#333333"/>
          <ellipse cx="60" cy="38" rx="20" ry="6" fill="#444444"/>

          {/* Nariz triangular icônico */}
          <path d="M 60 60 L 55 70 L 65 70 Z" fill="#1a1a1a"/>

          {/* Respirador/boca característico */}
          <ellipse cx="60" cy="75" rx="8" ry="4" fill="#333333"/>
          <rect x="56" y="73" width="8" height="4" rx="2" fill="#666666"/>
          <ellipse cx="60" cy="75" rx="6" ry="2" fill="#888888"/>

          {/* Grades de ventilação */}
          <line x1="55" y1="74" x2="65" y2="74" stroke="#444444" strokeWidth="0.5"/>
          <line x1="55" y1="76" x2="65" y2="76" stroke="#444444" strokeWidth="0.5"/>

          {/* Olhos vermelhos mais intensos e triangulares */}
          <ellipse cx="50" cy="55" rx="5" ry="7" fill="#cc0000"/>
          <ellipse cx="70" cy="55" rx="5" ry="7" fill="#cc0000"/>
          <ellipse cx="50" cy="55" rx="3" ry="5" fill="#ff0000"/>
          <ellipse cx="70" cy="55" rx="3" ry="5" fill="#ff0000"/>
          <ellipse cx="50" cy="53" rx="2" ry="3" fill="#ff4444"/>
          <ellipse cx="70" cy="53" rx="2" ry="3" fill="#ff4444"/>

          {/* Reflexos nos olhos */}
          <ellipse cx="49" cy="52" rx="0.5" ry="1" fill="#ffaaaa"/>
          <ellipse cx="69" cy="52" rx="0.5" ry="1" fill="#ffaaaa"/>

          {/* Painel de controle do peito */}
          <rect x="50" y="85" width="20" height="15" rx="3" fill="#1a1a1a"/>
          <rect x="52" y="87" width="16" height="11" rx="2" fill="#333333"/>

          {/* Luzes do painel */}
          <circle cx="55" cy="90" r="1.5" fill="#ff0000"/>
          <circle cx="60" cy="90" r="1.5" fill="#00ff00"/>
          <circle cx="65" cy="90" r="1.5" fill="#ffff00"/>
          <rect x="53" y="93" width="14" height="1" rx="0.5" fill="#666666"/>
          <rect x="53" y="95" width="10" height="1" rx="0.5" fill="#666666"/>

          {/* Capa/ombros */}
          <ellipse cx="60" cy="105" rx="45" ry="15" fill="#000000"/>
        </svg>
      </div>
    );
  }

  // Fallback para outros casos
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 120 120" className="w-12 h-12">
        <circle cx="60" cy="60" r="58" fill="#f5f5f5" opacity="0.9"/>
        <circle cx="60" cy="50" r="15" fill="#bdbdbd"/>
        <ellipse cx="60" cy="80" rx="20" ry="25" fill="#bdbdbd"/>
      </svg>
    </div>
  );
}