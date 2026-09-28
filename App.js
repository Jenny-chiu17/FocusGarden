import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, BackHandler, Platform } from 'react-native';
import { CompleteScreen } from './src/screens/CompleteScreen';
import { GardenScreen } from './src/screens/GardenScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlantSelectionScreen } from './src/screens/PlantSelectionScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { TimerScreen } from './src/screens/TimerScreen';
import {
  defaultSubjects,
  legacyStorageKeys,
  storageKey,
  waterPerBloom,
} from './src/constants';
import {
  calculateWaterReward,
  getPlant,
  getPlantStage,
  getTodayKey,
} from './src/utils';
import { subjectLabel, t } from './src/i18n';

const initialState = {
  subjects: defaultSubjects,
  sessions: [],
  gardenPlants: [],
  activeGardenPlantId: null,
  pendingDrops: 0,
  pendingRewardPlantId: null,
  activeTimer: null,
  strictFocusMode: false,
  language: 'en',
};

const finalWaterRequirement = waterPerBloom;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function scheduleCompletionNotification(seconds, subject, language) {
  if (Platform.OS === 'web' || seconds <= 0) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('focus-timer', {
      name: 'Focus timer',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (permission.status !== 'granted') return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: language === 'zh-TW' ? '專注完成' : 'Focus session complete',
      body: language === 'zh-TW'
        ? `${subjectLabel(language, subject)}已完成，水滴獎勵已準備好。`
        : `${subjectLabel(language, subject)} is finished. Your water drops are ready.`,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.ceil(seconds)),
      channelId: Platform.OS === 'android' ? 'focus-timer' : undefined,
    },
  });
}

async function cancelCompletionNotification(identifier) {
  if (Platform.OS !== 'web' && identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
  }
}

function createGardenPlant(plantId) {
  return {
    id: `${plantId}-${Date.now()}`,
    plantId,
    waterDrops: 0,
    bloomCount: 0,
  };
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [subjects, setSubjects] = useState(initialState.subjects);
  const [sessions, setSessions] = useState(initialState.sessions);
  const [gardenPlants, setGardenPlants] = useState(initialState.gardenPlants);
  const [activeGardenPlantId, setActiveGardenPlantId] = useState(initialState.activeGardenPlantId);
  const [pendingDrops, setPendingDrops] = useState(initialState.pendingDrops);
  const [pendingRewardPlantId, setPendingRewardPlantId] = useState(
    initialState.pendingRewardPlantId,
  );
  const [activeTimer, setActiveTimer] = useState(initialState.activeTimer);
  const [strictFocusMode, setStrictFocusMode] = useState(initialState.strictFocusMode);
  const [language, setLanguage] = useState(initialState.language);
  const [selectedSubject, setSelectedSubject] = useState(defaultSubjects[0]);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [newSubjectText, setNewSubjectText] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const timerEndsAtRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const isCompletingRef = useRef(false);

  const activeGardenPlant = useMemo(
    () => gardenPlants.find((gardenPlant) => gardenPlant.id === activeGardenPlantId) || null,
    [activeGardenPlantId, gardenPlants],
  );
  const activePlant = activeGardenPlant ? getPlant(activeGardenPlant.plantId) : null;
  const activePlantStage = activePlant
    ? getPlantStage(activePlant, activeGardenPlant.waterDrops)
    : null;
  const rewardGardenPlant = gardenPlants.find(
    (gardenPlant) => gardenPlant.id === pendingRewardPlantId,
  ) || activeGardenPlant;
  const rewardPlant = rewardGardenPlant ? getPlant(rewardGardenPlant.plantId) : null;
  const todayFocusSeconds = sessions
    .filter((session) => session.dateKey === getTodayKey())
    .reduce((total, session) => total + session.focusedSeconds, 0);
  const collectionCount = gardenPlants.reduce(
    (total, gardenPlant) => total + (gardenPlant.bloomCount || 0),
    0,
  );

  useEffect(() => {
    async function loadData() {
      try {
        await AsyncStorage.multiRemove(legacyStorageKeys);
        const storedValue = await AsyncStorage.getItem(storageKey);
        if (storedValue) {
          const parsed = JSON.parse(storedValue);
          let restoredSessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
          let restoredPendingDrops = Number(parsed.pendingDrops) || 0;
          let restoredRewardPlantId = parsed.pendingRewardPlantId
            || (restoredPendingDrops > 0 ? parsed.activeGardenPlantId : null)
            || null;

          setSubjects(parsed.subjects?.length ? parsed.subjects : initialState.subjects);
          setGardenPlants(Array.isArray(parsed.gardenPlants) ? parsed.gardenPlants : []);
          setActiveGardenPlantId(parsed.activeGardenPlantId || null);
          setStrictFocusMode(Boolean(parsed.strictFocusMode));
          setLanguage(parsed.language === 'zh-TW' ? 'zh-TW' : 'en');

          if (parsed.activeTimer) {
            const restoredTimer = parsed.activeTimer;
            const duration = Number(restoredTimer.selectedDuration) || 25;
            const durationSeconds = duration * 60;
            const secondsLeft = restoredTimer.isRunning
              ? Math.max(0, Math.ceil((restoredTimer.endsAt - Date.now()) / 1000))
              : Math.max(0, Number(restoredTimer.remainingSeconds) || 0);

            setSelectedSubject(restoredTimer.subject || defaultSubjects[0]);
            setSelectedDuration(duration);

            if (restoredTimer.isRunning && secondsLeft === 0) {
              const sessionId = restoredTimer.id || `session-${restoredTimer.startedAt}`;
              const alreadySaved = restoredSessions.some((session) => session.id === sessionId);
              const earnedDrops = calculateWaterReward(duration, durationSeconds);
              const recoveredSession = {
                id: sessionId,
                subject: restoredTimer.subject || defaultSubjects[0],
                selectedDuration: duration,
                focusedSeconds: durationSeconds,
                durationSeconds,
                earnedDrops,
                status: 'completed',
                interruptionCount: Number(restoredTimer.interruptionCount) || 0,
                createdAt: new Date(restoredTimer.startedAt || Date.now()).toISOString(),
                completedAt: new Date(restoredTimer.endsAt || Date.now()).toISOString(),
                dateKey: getTodayKey(new Date(restoredTimer.endsAt || Date.now())),
              };

              if (!alreadySaved) restoredSessions = [recoveredSession, ...restoredSessions];
              restoredPendingDrops += alreadySaved ? 0 : earnedDrops;
              restoredRewardPlantId = restoredRewardPlantId || parsed.activeGardenPlantId || null;
              setCompletedSession(recoveredSession);
              setScreen('complete');
            } else {
              const nextTimer = {
                ...restoredTimer,
                selectedDuration: duration,
                remainingSeconds: secondsLeft,
              };
              setActiveTimer(nextTimer);
              setRemainingSeconds(secondsLeft);
              setIsRunning(Boolean(restoredTimer.isRunning));
              timerEndsAtRef.current = restoredTimer.isRunning ? restoredTimer.endsAt : null;
              setScreen('timer');
            }
          }

          setSessions(restoredSessions);
          setPendingDrops(restoredPendingDrops);
          setPendingRewardPlantId(restoredRewardPlantId);
        }
      } catch {
        Alert.alert('Storage issue', 'FocusGarden could not load saved data.');
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    AsyncStorage.setItem(
      storageKey,
      JSON.stringify({
        subjects,
        sessions,
        gardenPlants,
        activeGardenPlantId,
        pendingDrops,
        pendingRewardPlantId,
        activeTimer,
        strictFocusMode,
        language,
      }),
    ).catch(() => {
      Alert.alert('Storage issue', 'FocusGarden could not save your latest progress.');
    });
  }, [
    activeGardenPlantId,
    activeTimer,
    gardenPlants,
    isLoaded,
    language,
    pendingDrops,
    pendingRewardPlantId,
    sessions,
    strictFocusMode,
    subjects,
  ]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const intervalId = setInterval(() => {
      if (!timerEndsAtRef.current) return;
      const secondsLeft = Math.max(0, Math.ceil((timerEndsAtRef.current - Date.now()) / 1000));

      if (secondsLeft <= 0) {
        completeSession(selectedDuration * 60);
        return;
      }

      setRemainingSeconds(secondsLeft);
    }, 250);

    return () => clearInterval(intervalId);
  }, [activeTimer, isRunning, selectedDuration]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appStateRef.current === 'active' && nextAppState !== 'active' && isRunning && strictFocusMode) {
        const secondsLeft = Math.max(0, Math.ceil((timerEndsAtRef.current - Date.now()) / 1000));
        void cancelCompletionNotification(activeTimer?.notificationId);
        setRemainingSeconds(secondsLeft);
        setIsRunning(false);
        timerEndsAtRef.current = null;
        setActiveTimer((currentTimer) => currentTimer
          ? {
            ...currentTimer,
            endsAt: null,
            remainingSeconds: secondsLeft,
            isRunning: false,
            pausedByStrictMode: true,
            interruptionCount: (Number(currentTimer.interruptionCount) || 0) + 1,
            notificationId: null,
          }
          : currentTimer);
      } else if (appStateRef.current !== 'active' && nextAppState === 'active' && isRunning) {
        const secondsLeft = Math.max(0, Math.ceil((timerEndsAtRef.current - Date.now()) / 1000));
        if (secondsLeft === 0) {
          completeSession(selectedDuration * 60, 'completed');
        } else {
          setRemainingSeconds(secondsLeft);
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [activeTimer, isRunning, selectedDuration, strictFocusMode]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'home') return false;
      if (screen === 'timer') return true;
      if (screen === 'plants') {
        setScreen(activePlant ? 'garden' : 'home');
      } else {
        setScreen('home');
      }
      return true;
    });

    return () => subscription.remove();
  }, [activePlant, screen]);

  function addSubject() {
    const nextSubject = newSubjectText.trim();
    if (!nextSubject) return;

    setSubjects((currentSubjects) => (
      currentSubjects.includes(nextSubject) ? currentSubjects : [...currentSubjects, nextSubject]
    ));
    setSelectedSubject(nextSubject);
    setNewSubjectText('');
  }

  function deleteSubject(subject) {
    if (subjects.length <= 1) return;

    const remainingSubjects = subjects.filter((item) => item !== subject);
    setSubjects(remainingSubjects);
    if (selectedSubject === subject) {
      setSelectedSubject(remainingSubjects[0]);
    }
  }

  function choosePlant(plantId) {
    setGardenPlants((currentPlants) => {
      const existingPlant = currentPlants.find((gardenPlant) => gardenPlant.plantId === plantId);
      if (existingPlant) {
        setActiveGardenPlantId(existingPlant.id);
        return currentPlants;
      }

      const nextPlant = createGardenPlant(plantId);
      setActiveGardenPlantId(nextPlant.id);
      return [...currentPlants, nextPlant];
    });
    setScreen('home');
  }

  async function startTimer() {
    const durationSeconds = selectedDuration * 60;
    const startedAt = Date.now();
    const endsAt = startedAt + durationSeconds * 1000;

    isCompletingRef.current = false;
    setRemainingSeconds(durationSeconds);
    timerEndsAtRef.current = endsAt;
    const notificationId = await scheduleCompletionNotification(
      durationSeconds,
      selectedSubject,
      language,
    );
    setActiveTimer({
      id: `session-${startedAt}`,
      subject: selectedSubject,
      selectedDuration,
      startedAt,
      endsAt,
      remainingSeconds: durationSeconds,
      isRunning: true,
      pausedByStrictMode: false,
      interruptionCount: 0,
      notificationId,
    });
    setIsRunning(true);
    setScreen('timer');
  }

  async function toggleTimer() {
    if (!isRunning) {
      const endsAt = Date.now() + remainingSeconds * 1000;
      const notificationId = await scheduleCompletionNotification(
        remainingSeconds,
        selectedSubject,
        language,
      );
      timerEndsAtRef.current = endsAt;
      setActiveTimer((currentTimer) => currentTimer
        ? {
          ...currentTimer,
          endsAt,
          remainingSeconds,
          isRunning: true,
          pausedByStrictMode: false,
          notificationId,
        }
        : currentTimer);
      setIsRunning(true);
      return;
    }

    const secondsLeft = Math.max(0, Math.ceil((timerEndsAtRef.current - Date.now()) / 1000));
    await cancelCompletionNotification(activeTimer?.notificationId);
    setRemainingSeconds(secondsLeft);
    timerEndsAtRef.current = null;
    setActiveTimer((currentTimer) => currentTimer
      ? {
        ...currentTimer,
        endsAt: null,
        remainingSeconds: secondsLeft,
        isRunning: false,
        pausedByStrictMode: false,
        notificationId: null,
      }
      : currentTimer);
    setIsRunning(false);
  }

  function completeSession(focusedSeconds, status = 'completed') {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    const safeFocusedSeconds = Math.max(0, focusedSeconds);
    const earnedDrops = calculateWaterReward(selectedDuration, safeFocusedSeconds);
    const completedAt = new Date();
    const session = {
      id: activeTimer?.id || `${Date.now()}`,
      subject: selectedSubject,
      selectedDuration,
      focusedSeconds: safeFocusedSeconds,
      durationSeconds: safeFocusedSeconds,
      earnedDrops,
      status,
      interruptionCount: Number(activeTimer?.interruptionCount) || 0,
      createdAt: activeTimer?.startedAt
        ? new Date(activeTimer.startedAt).toISOString()
        : completedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      dateKey: getTodayKey(completedAt),
    };

    setIsRunning(false);
    void cancelCompletionNotification(activeTimer?.notificationId);
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setActiveTimer(null);
    timerEndsAtRef.current = null;
    setSessions((currentSessions) => [session, ...currentSessions]);
    setPendingDrops((currentDrops) => currentDrops + earnedDrops);
    if (earnedDrops > 0) {
      setPendingRewardPlantId((currentPlantId) => currentPlantId || activeGardenPlantId);
    }
    setCompletedSession(session);
    setScreen('complete');
  }

  function finishEarly() {
    const totalSeconds = selectedDuration * 60;
    const focusedSeconds = Math.max(0, totalSeconds - remainingSeconds);
    completeSession(focusedSeconds, 'ended_early');
  }

  function discardSession() {
    void cancelCompletionNotification(activeTimer?.notificationId);
    setIsRunning(false);
    setActiveTimer(null);
    timerEndsAtRef.current = null;
    setRemainingSeconds(selectedDuration * 60);
    setScreen('home');
    isCompletingRef.current = false;
  }

  function chooseRewardPlant(gardenPlantId) {
    setPendingRewardPlantId(gardenPlantId);
    setActiveGardenPlantId(gardenPlantId);
  }

  function waterRewardPlant() {
    const targetPlantId = pendingRewardPlantId || activeGardenPlantId;
    if (!targetPlantId || pendingDrops <= 0) return;

    setGardenPlants((currentPlants) => currentPlants.map((gardenPlant) => {
      if (gardenPlant.id !== targetPlantId) return gardenPlant;

      const nextWaterDrops = gardenPlant.waterDrops + pendingDrops;
      const newBlooms = Math.floor(nextWaterDrops / finalWaterRequirement);

      return {
        ...gardenPlant,
        waterDrops: nextWaterDrops % finalWaterRequirement,
        bloomCount: (gardenPlant.bloomCount || 0) + newBlooms,
      };
    }));
    setPendingDrops(0);
    setPendingRewardPlantId(null);
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (screen === 'complete') {
      setCompletedSession((currentSession) => (
        currentSession ? { ...currentSession, rewardPending: false } : currentSession
      ));
    }
  }

  function clearHistory() {
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`${t(language, 'clearQuestion')}\n\n${t(language, 'clearBody')}`)) {
        setSessions([]);
      }
      return;
    }

    Alert.alert(t(language, 'clearQuestion'), t(language, 'clearBody'), [
      { text: t(language, 'cancel'), style: 'cancel' },
      { text: t(language, 'clear'), style: 'destructive', onPress: () => setSessions([]) },
    ]);
  }

  if (!isLoaded) {
    return null;
  }

  if (screen === 'setup') {
    return (
      <SetupScreen
        language={language}
        subjects={subjects}
        selectedSubject={selectedSubject}
        selectedDuration={selectedDuration}
        strictFocusMode={strictFocusMode}
        newSubjectText={newSubjectText}
        onSubject={setSelectedSubject}
        onDuration={setSelectedDuration}
        onStrictFocusMode={setStrictFocusMode}
        onNewSubjectText={setNewSubjectText}
        onAddSubject={addSubject}
        onDeleteSubject={deleteSubject}
        onBack={() => setScreen('home')}
        onStart={startTimer}
      />
    );
  }

  if (screen === 'timer') {
    return (
      <TimerScreen
        language={language}
        subject={selectedSubject}
        remainingSeconds={remainingSeconds}
        isRunning={isRunning}
        pausedByStrictMode={Boolean(activeTimer?.pausedByStrictMode)}
        interruptionCount={Number(activeTimer?.interruptionCount) || 0}
        onPause={toggleTimer}
        onFinish={finishEarly}
        onDiscard={discardSession}
      />
    );
  }

  if (screen === 'complete' && completedSession) {
    return (
      <CompleteScreen
        language={language}
        subject={completedSession.subject}
        focusedSeconds={completedSession.focusedSeconds}
        plant={rewardPlant}
        gardenPlants={gardenPlants}
        rewardGardenPlantId={pendingRewardPlantId}
        earnedDrops={completedSession.earnedDrops}
        rewardPending={pendingDrops > 0}
        interruptionCount={Number(completedSession.interruptionCount) || 0}
        onChooseRewardPlant={chooseRewardPlant}
        onWater={waterRewardPlant}
        onHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'garden') {
    return (
      <GardenScreen
        language={language}
        gardenPlants={gardenPlants}
        activeGardenPlantId={activeGardenPlantId}
        pendingDrops={pendingDrops}
        pendingRewardPlantId={pendingRewardPlantId}
        onBack={() => setScreen('home')}
        onChoosePlant={() => setScreen('plants')}
        onSelectPlant={setActiveGardenPlantId}
        onWater={waterRewardPlant}
      />
    );
  }

  if (screen === 'plants') {
    return (
      <PlantSelectionScreen
        language={language}
        gardenPlants={gardenPlants}
        onBack={() => setScreen(activeGardenPlant ? 'garden' : 'home')}
        onChoose={choosePlant}
      />
    );
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        language={language}
        sessions={sessions}
        onBack={() => setScreen('home')}
        onClear={clearHistory}
      />
    );
  }

  return (
    <HomeScreen
      language={language}
      onLanguageChange={setLanguage}
      todayFocusSeconds={todayFocusSeconds}
      plant={activePlant}
      plantStage={activePlantStage}
      plantWater={activeGardenPlant?.waterDrops || 0}
      bloomCount={activeGardenPlant?.bloomCount || 0}
      pendingDrops={activeGardenPlant?.id === pendingRewardPlantId ? pendingDrops : 0}
      sessionsCount={sessions.length}
      collectionCount={collectionCount}
      onStart={() => setScreen(activePlant ? 'setup' : 'plants')}
      onHistory={() => setScreen('history')}
      onGarden={() => setScreen('garden')}
      onChoosePlant={() => setScreen('plants')}
      onWater={waterRewardPlant}
    />
  );
}
