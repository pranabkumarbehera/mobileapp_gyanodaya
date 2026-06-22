import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

interface LinearGradientProps extends ViewProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  style?: ViewStyle;
  children?: React.ReactNode;
}

const LinearGradient: React.FC<LinearGradientProps> = ({
  colors,
  start = { x: 0.5, y: 0 },
  end = { x: 0.5, y: 1 },
  locations,
  style,
  children,
  ...props
}) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  const angleStr = `${(angle + 360) % 360}deg`;

  const colorStops = colors
    .map((color, index) => {
      if (locations && locations[index] !== undefined) {
        return `${color} ${locations[index] * 100}%`;
      }
      return color;
    })
    .join(', ');

  const gradientString = `linear-gradient(${angleStr}, ${colorStops})`;

  // We merge style with a custom backgroundImage style which react-native-web translates to CSS
  const mergedStyle: any = [
    style,
    {
      backgroundImage: gradientString,
    },
  ];

  return (
    <View style={mergedStyle} {...props}>
      {children}
    </View>
  );
};

export default LinearGradient;
export { LinearGradient };
