'use client';

import React, { useState, useEffect } from 'react';
import { appConfig } from '@/config/app-config';

interface HorizontalContainerProps {
  children: React.ReactNode;
  containerMargin?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
  elementsPerRowVeryLarge?: number;
  elementsPerRowLarge?: number;
  elementsPerRowMedium?: number;
  elementsPerRowSmall?: number;
  alignment?: 'left' | 'center' | 'right';
  width?: number | string;
}

export default function HorizontalContainer({
  children,
  containerMargin = appConfig.components.horizontalContainer.containerMargin,
  horizontalPadding = appConfig.components.horizontalContainer.horizontalPadding,
  verticalPadding = appConfig.components.horizontalContainer.verticalPadding,
  elementsPerRowVeryLarge = appConfig.components.horizontalContainer.elementsPerRowVeryLarge,
  elementsPerRowLarge = appConfig.components.horizontalContainer.elementsPerRowLarge,
  elementsPerRowMedium = appConfig.components.horizontalContainer.elementsPerRowMedium,
  elementsPerRowSmall = appConfig.components.horizontalContainer.elementsPerRowSmall,
  alignment = appConfig.components.horizontalContainer.alignment,
  width = appConfig.components.horizontalContainer.width,
}: HorizontalContainerProps) {
  const [columns, setColumns] = useState(elementsPerRowSmall);
  const showBorders = appConfig.dev.showElementBorders;

  const getJustifyContent = () => {
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateColumns = () => {
      const width = window.innerWidth;
      
      if (width >= appConfig.view.breakpointVeryLarge) {
        setColumns(elementsPerRowVeryLarge);
      } else if (width >= appConfig.view.breakpointLarge) {
        setColumns(elementsPerRowLarge);
      } else if (width >= appConfig.view.breakpointMedium) {
        setColumns(elementsPerRowMedium);
      } else {
        setColumns(elementsPerRowSmall);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [elementsPerRowVeryLarge, elementsPerRowLarge, elementsPerRowMedium, elementsPerRowSmall]);

  // Split children into rows based on columns
  const childrenArray = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < childrenArray.length; i += columns) {
    rows.push(childrenArray.slice(i, i + columns));
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${verticalPadding}px`,
        margin: `${containerMargin}px`,
        border: showBorders ? '1px dotted black' : 'none',
        width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
      }}
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'flex',
            justifyContent: getJustifyContent(),
            gap: `${horizontalPadding}px`,
          }}
        >
          {row.map((child, childIndex) => (
            <div key={childIndex}>
              {child}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
