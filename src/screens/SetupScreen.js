import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { DurationButton } from '../components/DurationButton';
import { SubjectButton } from '../components/SubjectButton';
import { durations } from '../constants';
import { styles } from '../styles';
import { subjectLabel, t } from '../i18n';

export function SetupScreen({
  language,
  subjects,
  selectedSubject,
  selectedDuration,
  strictFocusMode,
  newSubjectText,
  onSubject,
  onDuration,
  onStrictFocusMode,
  onNewSubjectText,
  onAddSubject,
  onDeleteSubject,
  onBack,
  onStart,
}) {
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  function confirmDeleteSubject() {
    onDeleteSubject(subjectToDelete);
    setSubjectToDelete(null);
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar style="dark" />
        <View style={styles.contentFrame}>
        <Pressable accessibilityRole="button" onPress={onBack}>
          <Text style={styles.backButton}>{t(language, 'back')}</Text>
        </Pressable>

        <Text style={styles.pageTitle}>{t(language, 'setupTitle')}</Text>
        <Text style={styles.pageSubtitle}>
          {t(language, 'setupSubtitle')}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t(language, 'selectSubject')}</Text>
          {subjects.map((subject) => (
            <SubjectButton
              key={subject}
              subject={subject}
              label={subjectLabel(language, subject)}
              selected={selectedSubject === subject}
              canDelete={subjects.length > 1}
              deleteLabel={`${t(language, 'deleteSubject')} ${subjectLabel(language, subject)}`}
              onPress={() => onSubject(subject)}
              onDelete={setSubjectToDelete}
            />
          ))}

          <View style={styles.customSubjectRow}>
            <TextInput
              style={styles.customSubjectInput}
              value={newSubjectText}
              onChangeText={onNewSubjectText}
              placeholder={t(language, 'addSubjectPlaceholder')}
              placeholderTextColor="#8A9A8D"
              returnKeyType="done"
              onSubmitEditing={onAddSubject}
            />
            <Pressable style={styles.addSubjectButton} onPress={onAddSubject}>
              <Text style={styles.addSubjectButtonText}>{t(language, 'add')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.durationSection}>
          <Text style={styles.cardLabel}>{t(language, 'focusTime')}</Text>
          <View style={styles.durationRow}>
            {durations.map((duration) => (
              <DurationButton
                key={duration}
                duration={duration}
                language={language}
                selected={selectedDuration === duration}
                onPress={() => onDuration(duration)}
              />
            ))}
          </View>
        </View>

        <View style={styles.strictModeRow}>
          <View style={styles.strictModeCopy}>
            <Text style={styles.strictModeTitle}>{t(language, 'strictMode')}</Text>
            <Text style={styles.strictModeText}>
              {t(language, 'strictModeText')}
            </Text>
          </View>
          <Switch
            value={strictFocusMode}
            onValueChange={onStrictFocusMode}
            trackColor={{ false: '#C9D6C8', true: '#80AD8D' }}
            thumbColor={strictFocusMode ? '#3D704A' : '#FFFFFF'}
            accessibilityLabel={t(language, 'strictMode')}
          />
        </View>

        <Pressable
          disabled={!selectedSubject}
          style={[styles.primaryButton, !selectedSubject && styles.primaryButtonDisabled]}
          onPress={onStart}
        >
          <Text style={styles.primaryButtonText}>
            {selectedSubject ? t(language, 'startTimer') : t(language, 'selectSubject')}
          </Text>
        </Pressable>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(subjectToDelete)}
        onRequestClose={() => setSubjectToDelete(null)}
      >
        <View style={styles.confirmOverlay}>
          <View accessibilityRole="alert" style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>{t(language, 'deleteSubjectQuestion')}</Text>
            <Text style={styles.confirmBody}>
              {t(language, 'deleteSubjectBody').replace(
                '{subject}',
                subjectLabel(language, subjectToDelete),
              )}
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                accessibilityRole="button"
                style={styles.confirmCancelButton}
                onPress={() => setSubjectToDelete(null)}
              >
                <Text style={styles.confirmCancelText}>{t(language, 'cancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteSubject}
              >
                <Text style={styles.confirmDeleteText}>{t(language, 'delete')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
