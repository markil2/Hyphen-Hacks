import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

/** One hand-drawn line set: 24px grid, 1.7 stroke, round joins. */
const paths = {
  home: <Path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  rooms: (
    <>
      <Path d="M3.5 11 12 4l8.5 7" />
      <Path d="M5.5 9.5V20h13V9.5" />
      <Path d="M12 20v-6.5M5.5 14.5h13" />
    </>
  ),
  support: (
    <>
      <Path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-7l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z" />
      <Path d="M8.5 10.5h7M8.5 13.5h4" />
    </>
  ),
  community: (
    <>
      <Circle cx={9} cy={9} r={3} />
      <Circle cx={16.5} cy={10} r={2.4} />
      <Path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 14.6c.6-.3 1.3-.4 2-.4 2.2 0 3.7 1.5 4.1 4.3" />
    </>
  ),
  profile: (
    <>
      <Circle cx={12} cy={8.5} r={3.5} />
      <Path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6" />
    </>
  ),
  back: <Path d="M14.5 5.5 8 12l6.5 6.5" />,
  chevron: <Path d="M9.5 5.5 16 12l-6.5 6.5" />,
  up: <Path d="M5.5 14.5 12 8l6.5 6.5" />,
  down: <Path d="M5.5 9.5 12 16l6.5-6.5" />,
  monitor: (
    <>
      <Rect x={3.5} y={5} width={17} height={12} rx={2} />
      <Path d="M9 20.5h6M12 17v3.5" />
      <Circle cx={12} cy={11} r={2.4} />
    </>
  ),
  ruler: (
    <>
      <Rect x={8} y={2.5} width={8} height={19} rx={1.2} />
      <Path d="M8 6.5h3M8 10h2M8 13.5h3M8 17h2" />
    </>
  ),
  link: <Path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  mail: (
    <>
      <Rect x={3.5} y={5.5} width={17} height={13} rx={1.6} />
      <Path d="M4 7l8 6 8-6" />
    </>
  ),
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  edit: (
    <>
      <Path d="M14.5 5.5 18.5 9.5 9 19H5v-4z" />
      <Path d="M12.5 7.5l4 4" />
    </>
  ),
  trash: (
    <>
      <Path d="M5 7h14M10 7V5h4v2M7 7l.8 12a1 1 0 0 0 1 .9h6.4a1 1 0 0 0 1-.9L17 7" />
      <Path d="M10.5 10.5v6M13.5 10.5v6" />
    </>
  ),
  bookmark: <Path d="M7 4.5h10a.5.5 0 0 1 .5.5v15l-5.5-4-5.5 4V5a.5.5 0 0 1 .5-.5z" />,
  search: (
    <>
      <Circle cx={11} cy={11} r={6} />
      <Path d="M15.5 15.5 20 20" />
    </>
  ),
  clock: (
    <>
      <Circle cx={12} cy={12} r={8} />
      <Path d="M12 7.5V12l3 2" />
    </>
  ),
  moon: <Path d="M18.5 14.5A7 7 0 0 1 9.5 5.5a7 7 0 1 0 9 9z" />,
  bottle: (
    <>
      <Path d="M10 3.5h4M9.5 6.5h5M10.5 3.5v3M13.5 3.5v3" />
      <Path d="M9 6.5h6l.8 2.2a3 3 0 0 1 .2 1.1V19a1.5 1.5 0 0 1-1.5 1.5h-4.9A1.5 1.5 0 0 1 8 19V9.8a3 3 0 0 1 .2-1.1z" />
      <Path d="M8.5 12.5h3M8.5 15.5h3" />
    </>
  ),
  bowl: (
    <>
      <Path d="M3.5 11.5h17a8.5 7 0 0 1-17 0z" />
      <Path d="M9 18.5h6M15 4.5l-2.5 6" />
    </>
  ),
  pantry: (
    <>
      <Rect x={4.5} y={3.5} width={15} height={17} rx={1.2} />
      <Path d="M4.5 10h15M4.5 15.5h15M8 6.5v1.5M12 6.5v1.5M9 12.5v1M14 12.5v1" />
    </>
  ),
  leaf: (
    <>
      <Path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" />
      <Path d="M5 19 13 11" />
    </>
  ),
  phone: (
    <>
      <Rect x={7} y={3} width={10} height={18} rx={2} />
      <Path d="M11 17.5h2" />
    </>
  ),
  shield: (
    <>
      <Path d="M12 3.5 19 6v5.5c0 4.2-3 7.7-7 9-4-1.3-7-4.8-7-9V6z" />
      <Path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  shieldOff: (
    <>
      <Path d="M12 3.5 19 6v5.5c0 4.2-3 7.7-7 9-4-1.3-7-4.8-7-9V6z" />
      <Path d="M12 8.5v4.5M12 15.8v.2" />
    </>
  ),
  alert: (
    <>
      <Path d="M12 4 21 19.5H3z" />
      <Path d="M12 10v4.5M12 17v.1" />
    </>
  ),
  info: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 11v5.5M12 8v.1" />
    </>
  ),
  flag: <Path d="M6 20.5V4.5M6 5h11l-2 4 2 4H6" />,
  eyeOff: (
    <>
      <Path d="M4 4l16 16M9.9 6.2A8.6 8.6 0 0 1 12 6c5 0 8.5 4.5 9 6-.3.9-1.4 2.6-3.1 4M6.3 7.8C4.6 9.1 3.4 10.9 3 12c.5 1.5 4 6 9 6 1.3 0 2.5-.3 3.6-.8" />
      <Path d="M10 10.2a2.5 2.5 0 0 0 3.6 3.5" />
    </>
  ),
  send: <Path d="M4.5 12 20 4.5l-4.5 15-3.5-6z M12 13.5 20 4.5" />,
  calendar: (
    <>
      <Rect x={4} y={5.5} width={16} height={14.5} rx={1.6} />
      <Path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  video: (
    <>
      <Rect x={3.5} y={6.5} width={12} height={11} rx={1.6} />
      <Path d="M15.5 10.5 20.5 7.5v9l-5-3" />
    </>
  ),
  chat: <Path d="M4.5 6.5h15v9.5H10l-4 3.5V16H4.5z" />,
  call: (
    <Path d="M7.5 4h2.8l1.4 4-2 1.4a10 10 0 0 0 4.9 4.9l1.4-2 4 1.4v2.8a1.5 1.5 0 0 1-1.6 1.5A15 15 0 0 1 6 5.6 1.5 1.5 0 0 1 7.5 4z" />
  ),
  sprout: (
    <>
      <Path d="M12 20.5v-8" />
      <Path d="M12 12.5C12 8.5 9.5 6 5 6c0 4 2.5 6.5 7 6.5zM12 14c0-3.5 2.2-5.6 6.5-5.6 0 3.5-2.2 5.6-6.5 5.6z" />
    </>
  ),
  drop: <Path d="M12 3.5c3 4 5.5 7.2 5.5 10a5.5 5.5 0 0 1-11 0c0-2.8 2.5-6 5.5-10z" />,
  lamp: (
    <>
      <Path d="M8 4h8l2 7H6z" />
      <Path d="M12 11v7M8.5 20h7M15 11v3" />
    </>
  ),
  sparkle: <Path d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" />,
  settings: (
    <>
      <Circle cx={12} cy={12} r={2.8} />
      <Path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    </>
  ),
  history: (
    <>
      <Path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9" />
      <Path d="M4.5 4.5V9H9M12 8v4l3 2" />
    </>
  ),
  heart: (
    <Path d="M12 19.5s-7.5-4.4-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10z" />
  ),
  baby: (
    <>
      <Circle cx={12} cy={9} r={4.5} />
      <Path d="M10.3 9.5h.1M13.6 9.5h.1M10.8 11.4c.7.5 1.7.5 2.4 0M7 20c.6-3 2.6-4.8 5-4.8s4.4 1.8 5 4.8" />
    </>
  ),
  diaper: (
    <>
      <Path d="M3.5 7h17v3.5c0 4.6-3.8 8.5-8.5 8.5S3.5 15.1 3.5 10.5z" />
      <Path d="M3.5 10.5h4c0 2 1.4 3.5 3 4M20.5 10.5h-4c0 2-1.4 3.5-3 4" />
    </>
  ),
  play: (
    <>
      <Circle cx={8} cy={15} r={3.5} />
      <Rect x={13} y={11.5} width={7} height={7} rx={1} />
      <Path d="M8 4.5 11.5 10h-7z" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 22,
  color = colors.charcoal,
  strokeWidth = 1.7,
  fill = 'none',
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}) {
  return (
    <View aria-hidden pointerEvents="none" style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round">
        {paths[name]}
      </Svg>
    </View>
  );
}
