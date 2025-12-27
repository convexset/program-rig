import { appConfig } from '@/config/app-config';

interface VerticalSeparatorProps {
  height?: string;
}

export default function VerticalSeparator({
  height = appConfig.components.verticalSeparator.height,
}: VerticalSeparatorProps) {
  return (
    <div
      role="presentation"
      style={{
        height: height,
      }}
    />
  );
}
