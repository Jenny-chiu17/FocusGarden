import { Pressable, Text } from 'react-native';
import { styles } from '../styles';

export function DurationButton({ duration, selected, onPress, language = 'en' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.durationButton, selected && styles.selectedButton]}
      onPress={onPress}
    >
      <Text style={[styles.durationText, selected && styles.selectedText]}>
        {duration} {language === 'zh-TW' ? '分鐘' : 'min'}
      </Text>
    </Pressable>
  );
}
