import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

const palette = {
  rose: { flower: '#D94A5A', center: '#F5C04A', leaf: '#4F8F68' },
  sunflower: { flower: '#F5C84C', center: '#79502D', leaf: '#4F8F68' },
  tulip: { flower: '#E56B91', center: '#F3A3B9', leaf: '#4F8F68' },
  cactus: { flower: '#E56B91', center: '#F5C04A', leaf: '#5A9D62' },
  lavender: { flower: '#8B72C7', center: '#C8B9EA', leaf: '#4F8F68' },
};

function Leaves({ color, tall = false }) {
  return (
    <G>
      <Line x1="32" y1={tall ? '22' : '30'} x2="32" y2="55" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <Ellipse cx="24" cy="40" rx="9" ry="5" fill={color} transform="rotate(28 24 40)" />
      <Ellipse cx="40" cy="33" rx="9" ry="5" fill={color} transform="rotate(-28 40 33)" />
    </G>
  );
}

function FlowerHead({ plantId, colors }) {
  if (plantId === 'tulip') {
    return <Path d="M20 25 C21 12 28 18 32 8 C36 18 43 12 44 25 C42 34 22 34 20 25Z" fill={colors.flower} />;
  }
  if (plantId === 'lavender') {
    return (
      <G>
        {[13, 19, 25, 31].map((y, index) => (
          <G key={y}>
            <Circle cx={index % 2 ? '28' : '35'} cy={y} r="5" fill={colors.flower} />
            <Circle cx={index % 2 ? '36' : '29'} cy={y + 2} r="5" fill={colors.center} />
          </G>
        ))}
      </G>
    );
  }
  return (
    <G>
      <Circle cx="32" cy="13" r="9" fill={colors.flower} />
      <Circle cx="20" cy="22" r="9" fill={colors.flower} />
      <Circle cx="44" cy="22" r="9" fill={colors.flower} />
      <Circle cx="25" cy="33" r="9" fill={colors.flower} />
      <Circle cx="39" cy="33" r="9" fill={colors.flower} />
      <Circle cx="32" cy="23" r="8" fill={colors.center} />
    </G>
  );
}

export function PlantVisual({ plantId = 'rose', stageIndex = 4, size = 44 }) {
  const colors = palette[plantId] || palette.rose;

  if (stageIndex === 0) {
    return (
      <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Seed">
        <Ellipse cx="32" cy="51" rx="20" ry="5" fill="#8B6845" opacity="0.42" />
        <Ellipse cx="32" cy="42" rx="8" ry="12" fill="#A86F3D" transform="rotate(28 32 42)" />
        <Path d="M29 34 C31 30 34 29 37 29" stroke="#E7C89A" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }

  if (plantId === 'cactus' && stageIndex >= 3) {
    return (
      <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Cactus">
        <Rect x="25" y="13" width="14" height="44" rx="7" fill={colors.leaf} />
        <Path d="M25 36 H19 C14 36 14 31 14 27" stroke={colors.leaf} strokeWidth="8" strokeLinecap="round" fill="none" />
        <Path d="M39 30 H45 C50 30 50 24 50 21" stroke={colors.leaf} strokeWidth="8" strokeLinecap="round" fill="none" />
        {stageIndex >= 4 && <Circle cx="32" cy="10" r="7" fill={colors.flower} />}
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Growing plant">
      <Leaves color={colors.leaf} tall={stageIndex >= 3} />
      {stageIndex === 1 && <Circle cx="32" cy="28" r="4" fill="#72AD6E" />}
      {stageIndex === 2 && <Ellipse cx="32" cy="25" rx="8" ry="11" fill={colors.leaf} />}
      {stageIndex === 3 && <Ellipse cx="32" cy="20" rx="9" ry="12" fill={colors.flower} />}
      {stageIndex >= 4 && <FlowerHead plantId={plantId} colors={colors} />}
    </Svg>
  );
}

const visitorColors = {
  cow: ['#F7F1E7', '#8B5E4A'],
  sheep: ['#F4EFE2', '#9B8775'],
  horse: ['#9B6548', '#5C3D32'],
  dog: ['#D69A68', '#744E3C'],
  cat: ['#E6A45D', '#8A5A3B'],
};

export function VisitorVisual({ type = 'cat', size = 30 }) {
  const [face, accent] = visitorColors[type] || visitorColors.cat;
  const pointed = type === 'cat' || type === 'dog' || type === 'horse';
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityLabel={`${type} visitor`}>
      {pointed ? (
        <G>
          <Path d="M8 18 L11 5 L20 14Z" fill={accent} />
          <Path d="M40 18 L37 5 L28 14Z" fill={accent} />
        </G>
      ) : (
        <G>
          <Ellipse cx="8" cy="20" rx="7" ry="5" fill={accent} />
          <Ellipse cx="40" cy="20" rx="7" ry="5" fill={accent} />
        </G>
      )}
      <Circle cx="24" cy="25" r="17" fill={face} />
      {type === 'cow' && <Path d="M13 15 C18 9 24 12 25 18 C20 22 15 21 13 15Z" fill={accent} />}
      {type === 'sheep' && [12, 20, 28, 36].map((x) => <Circle key={x} cx={x} cy="12" r="6" fill="#FFFFFF" />)}
      <Circle cx="18" cy="24" r="2" fill="#29372D" />
      <Circle cx="30" cy="24" r="2" fill="#29372D" />
      <Ellipse cx="24" cy="32" rx="6" ry="4" fill={accent} opacity="0.75" />
    </Svg>
  );
}

export function AppMark({ size = 42 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="FocusGarden">
      <Ellipse cx="32" cy="54" rx="15" ry="4" fill="#8B6845" opacity="0.55" />
      <Line x1="32" y1="52" x2="32" y2="20" stroke="#4F8F68" strokeWidth="5" strokeLinecap="round" />
      <Ellipse cx="21" cy="25" rx="12" ry="7" fill="#78AE6D" transform="rotate(28 21 25)" />
      <Ellipse cx="43" cy="17" rx="12" ry="7" fill="#91C67F" transform="rotate(-25 43 17)" />
    </Svg>
  );
}
