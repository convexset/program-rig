interface CenteredTextProps {
  label: string;
  style?: 'normal' | 'rest';
  isShort?: boolean;
}

export default function CenteredText({ label, style = 'normal', isShort = false }: CenteredTextProps) {
  const bgColor = style === 'rest' ? '#e3f2fd' : '#ffffff';
  const textColor = style === 'rest' ? '#1976d2' : '#424242';
  
  // Rest mode: make centered short text large and bold
  const fontSize = style === 'rest' ? (isShort ? '2.5rem' : '1.8rem') : (isShort ? '1.4rem' : '1.8rem');
  const fontWeight = style === 'rest' ? '700' : (isShort ? '600' : '500');

  // Don't render if label is undefined or null
  if (label === undefined || label === null) {
    return null;
  }

  return (
    <div
      style={{
        textAlign: 'center',
        fontSize,
        fontWeight,
        padding: label ? '1.25rem 2rem' : '0.75rem',
        backgroundColor: bgColor,
        color: textColor,
        marginBottom: '0.5rem',
        borderRadius: label ? '4px' : '0',
        boxShadow: label ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        textTransform: style === 'rest' && isShort ? 'uppercase' : 'none',
        letterSpacing: style === 'rest' && isShort ? '0.05em' : 'normal',
      }}
    >
      {label}
    </div>
  );
}
