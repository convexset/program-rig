'use client';

import React from 'react';
import { appConfig } from '@/config/app-config';

interface VerticalContainerProps {
  children: React.ReactNode;
  containerMargin?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  alignment?: 'left' | 'center' | 'right';
}

export default function VerticalContainer({
  children,
  containerMargin = appConfig.components.verticalContainer.containerMargin,
  horizontalPadding = appConfig.components.verticalContainer.horizontalPadding,
  verticalPadding = appConfig.components.verticalContainer.verticalPadding,
  alignment = appConfig.components.verticalContainer.alignment,
}: VerticalContainerProps) {
  const showBorders = appConfig.dev.showElementBorders;
  
  const getAlignItems = () => {
    switch (alignment) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
      default:
        return 'center';
    }
  };
  
  return (
    <div
      className="flex flex-col"
      style={{
        margin: `${containerMargin}px`,
        border: showBorders ? '1px dotted black' : 'none',
        alignItems: getAlignItems(),
      }}
    >
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            paddingLeft: `${horizontalPadding}px`,
            paddingRight: `${horizontalPadding}px`,
            paddingTop: `${verticalPadding}px`,
            paddingBottom: `${verticalPadding}px`,
            width: '100%',
          }}
          key={index}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
