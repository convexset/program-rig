import { appConfig } from '@/config/app-config';

interface RectangleProps {
  width?: number;
  height?: number;
  borderColor?: string;
  borderThickness?: number;
  fillColor?: string;
}

export default function Rectangle({
  width = appConfig.components.rectangle.width,
  height = appConfig.components.rectangle.height,
  borderColor = appConfig.components.rectangle.borderColor,
  borderThickness = appConfig.components.rectangle.borderThickness,
  fillColor = appConfig.components.rectangle.fillColor,
}: RectangleProps) {
  return (
    <div
      role="presentation"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: fillColor,
        border: `${borderThickness}px solid ${borderColor}`,
        boxSizing: 'border-box',
      }}
    />
  );
}
