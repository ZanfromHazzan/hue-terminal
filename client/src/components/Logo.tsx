interface Props {
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className }: Props) {
  return (
    <img
      src="/omnipay-logo.png"
      alt="OmniPay"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
