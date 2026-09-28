import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SessionCard } from '../components/SessionCard';
import { styles } from '../styles';
import { AppMark } from '../components/GardenVisuals';
import { t } from '../i18n';

export function HistoryScreen({ language, sessions, onBack, onClear }) {
  const groupedSessions = sessions.reduce((groups, session) => {
    const dateKey = session.dateKey || session.completedAt?.slice(0, 10) || 'Earlier';
    const existingGroup = groups.find((group) => group.dateKey === dateKey);
    if (existingGroup) {
      existingGroup.sessions.push(session);
    } else {
      groups.push({ dateKey, sessions: [session] });
    }
    return groups;
  }, []);

  function getDateLabel(dateKey) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const toKey = (date) => (
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );

    if (dateKey === toKey(today)) return t(language, 'today');
    if (dateKey === toKey(yesterday)) return t(language, 'yesterday');
    if (dateKey === 'Earlier') return dateKey;
    return new Date(`${dateKey}T12:00:00`).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={styles.contentFrame}>
        <View style={styles.historyHeader}>
          <Pressable accessibilityRole="button" onPress={onBack}>
            <Text style={styles.backButton}>← {t(language, 'back')}</Text>
          </Pressable>
          {sessions.length > 0 && (
            <Pressable accessibilityRole="button" onPress={onClear}>
              <Text style={styles.clearText}>{t(language, 'clearHistory')}</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.pageTitle}>{t(language, 'focusHistory')}</Text>
        <Text style={styles.pageSubtitle}>
          {t(language, 'historySubtitle')}
        </Text>

        <View style={styles.historyList}>
          {sessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyPlant}><AppMark size={48} /></View>
              <Text style={styles.emptyTitle}>{t(language, 'noSessions')}</Text>
              <Text style={styles.emptyText}>
                {t(language, 'noSessionsText')}
              </Text>
            </View>
          ) : (
            groupedSessions.map((group) => (
              <View key={group.dateKey} style={styles.historyGroup}>
                <Text style={styles.historyDateHeading}>{getDateLabel(group.dateKey)}</Text>
                {group.sessions.map((session) => (
                  <SessionCard key={session.id} session={session} language={language} />
                ))}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
