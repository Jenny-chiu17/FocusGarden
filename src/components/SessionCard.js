import { Text, View } from 'react-native';
import { styles } from '../styles';
import { formatFocusedTime } from '../utils';
import { subjectLabel, t } from '../i18n';

export function SessionCard({ session, language = 'en' }) {
  const endedEarly = session.status
    ? session.status === 'ended_early'
    : session.focusedSeconds < session.selectedDuration * 60;

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionTop}>
        <Text style={styles.sessionSubject}>{subjectLabel(language, session.subject)}</Text>
        <View style={styles.sessionMeta}>
          <Text style={[styles.sessionStatus, endedEarly && styles.sessionStatusEarly]}>
            {endedEarly ? t(language, 'endedEarly') : t(language, 'completed')}
          </Text>
          <Text style={styles.sessionDuration}>
            {formatFocusedTime(session.durationSeconds, language)}
          </Text>
        </View>
      </View>
      <Text style={styles.sessionDate}>
        {new Date(session.completedAt).toLocaleString(language === 'zh-TW' ? 'zh-TW' : undefined)}
      </Text>
      <Text style={styles.sessionReward}>
        +{session.earnedDrops || 0} {t(language, 'waterDrops')}
      </Text>
      {(session.interruptionCount || 0) > 0 && (
        <Text style={styles.sessionInterruptions}>
          {t(language, 'interruptions')}: {session.interruptionCount}
        </Text>
      )}
    </View>
  );
}
