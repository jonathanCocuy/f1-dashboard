const countryToEmoji: Record<string, string> = {
  GB: '🇬🇧', DE: '🇩🇪', ES: '🇪🇸', FR: '🇫🇷', IT: '🇮🇹',
  NL: '🇳🇱', BE: '🇧🇪', AU: '🇦🇺', BR: '🇧🇷', MX: '🇲🇽',
  US: '🇺🇸', CA: '🇨🇦', JP: '🇯🇵', CN: '🇨🇳', AE: '🇦🇪',
  SA: '🇸🇦', BH: '🇧🇭', SG: '🇸🇬', HU: '🇭🇺', AT: '🇦🇹',
  MC: '🇲🇨', FI: '🇫🇮', DK: '🇩🇰', TH: '🇹🇭', NZ: '🇳🇿',
  AR: '🇦🇷', AZ: '🇦🇿', QA: '🇶🇦',
};

interface Props {
  countryCode: string;
  className?: string;
}

export function FlagIcon({ countryCode, className = '' }: Props) {
  const emoji = countryToEmoji[countryCode.toUpperCase()] ?? '🏁';
  return <span className={className}>{emoji}</span>;
}
