import { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';
import { formatTimer } from '../utils';
import { subjectLabel, t } from '../i18n';

export function TimerScreen({
  language,
  subject,
  remainingSeconds,
  isRunning,
  pausedByStrictMode,
  interruptionCount = 0,
  onPause,
  onFinish,
  onDiscard,
}) {
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const resumeAfterCancelRef = useRef(false);
  const message = isRunning
    ? t(language, 'timerRunning')
    : pausedByStrictMode
      ? t(language, 'timerStrictPaused')
      : t(language, 'timerPaused');

  function openFinishDialog() {
    resumeAfterCancelRef.current = isRunning;
    if (isRunning) onPause();
    setShowFinishDialog(true);
  }

  function keepFocusing() {
    setShowFinishDialog(false);
    if (resumeAfterCancelRef.current) onPause();
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.timerScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={styles.contentFrame}>
        <View style={styles.timerContent}>
          <Text style={styles.timerSubject}>{subjectLabel(language, subject)}</Text>
          <Text style={styles.timerValue}>{formatTimer(remainingSeconds)}</Text>
          <Text style={styles.timerMessage}>{message}</Text>
          {interruptionCount > 0 && (
            <Text style={styles.timerInterruptionCount}>
              {t(language, 'interruptions')}: {interruptionCount}
            </Text>
          )}

          <Pressable accessibilityRole="button" style={styles.timerButton} onPress={onPause}>
            <Text style={styles.primaryButtonText}>
              {isRunning ? t(language, 'pause') : t(language, 'resume')}
            </Text>
          </Pressable>

          <Pressable accessibilityRole="button" style={styles.finishButton} onPress={openFinishDialog}>
            <Text style={styles.finishButtonText}>{t(language, 'finishEarly')}</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showFinishDialog}
        onRequestClose={keepFocusing}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.finishDialog}>
            <Text style={styles.finishDialogTitle}>{t(language, 'finishQuestion')}</Text>
            <Text style={styles.finishDialogText}>
              {t(language, 'finishText')}
            </Text>
            <Pressable style={styles.primaryButton} onPress={onFinish}>
              <Text style={styles.primaryButtonText}>{t(language, 'saveFocus')}</Text>
            </Pressable>
            <Pressable style={styles.dialogSecondaryButton} onPress={keepFocusing}>
              <Text style={styles.secondaryButtonText}>{t(language, 'keepFocusing')}</Text>
            </Pressable>
            <Pressable style={styles.dialogDiscardButton} onPress={onDiscard}>
              <Text style={styles.dialogDiscardText}>{t(language, 'discardSession')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
