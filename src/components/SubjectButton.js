import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles';

export function SubjectButton({
  subject,
  label = subject,
  selected,
  canDelete,
  deleteLabel,
  onPress,
  onDelete,
}) {
  return (
    <View style={styles.subjectRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        style={[styles.subjectButton, selected && styles.selectedButton]}
        onPress={onPress}
      >
        <Text style={[styles.subjectText, selected && styles.selectedText]}>
          {label}{selected ? '  ✓' : ''}
        </Text>
      </Pressable>
      {canDelete && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          hitSlop={6}
          style={styles.deleteSubjectButton}
          onPress={() => onDelete(subject)}
        >
          <Text style={styles.deleteSubjectButtonText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}
