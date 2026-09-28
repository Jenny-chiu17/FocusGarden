import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GardenCard } from '../components/GardenCard';
import { AppMark } from '../components/GardenVisuals';
import { styles } from '../styles';
import { formatFocusedTime } from '../utils';
import { t } from '../i18n';

export function HomeScreen({
  language,
  onLanguageChange,
  todayFocusSeconds,
  plant,
  plantStage,
  plantWater,
  bloomCount,
  pendingDrops,
  sessionsCount,
  collectionCount,
  onStart,
  onHistory,
  onGarden,
  onChoosePlant,
  onWater,
}) {
  const canStartFocus = Boolean(plant);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={styles.contentFrame}>
        <View style={styles.languageControl}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: language === 'en' }}
            style={[styles.languageButton, language === 'en' && styles.languageButtonSelected]}
            onPress={() => onLanguageChange('en')}
          >
            <Text style={[styles.languageText, language === 'en' && styles.languageTextSelected]}>EN</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: language === 'zh-TW' }}
            style={[styles.languageButton, language === 'zh-TW' && styles.languageButtonSelected]}
            onPress={() => onLanguageChange('zh-TW')}
          >
            <Text style={[styles.languageText, language === 'zh-TW' && styles.languageTextSelected]}>繁中</Text>
          </Pressable>
        </View>
        <View style={styles.logo}><AppMark size={46} /></View>
        <Text style={styles.title}>FocusGarden</Text>
        <Text style={styles.subtitle}>
          {t(language, 'appSubtitle')}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t(language, 'todayFocus')}</Text>
          <Text style={styles.focusTime}>{formatFocusedTime(todayFocusSeconds, language)}</Text>
          <Text style={styles.cardDescription}>
            {t(language, 'homeDescription')}
          </Text>
        </View>

        {canStartFocus && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start a focus session"
            style={styles.primaryButton}
            onPress={onStart}
          >
            <Text style={styles.primaryButtonText}>{t(language, 'startFocus')}</Text>
          </Pressable>
        )}

        {plant ? (
          <GardenCard
            plant={plant}
            stage={plantStage}
            waterDrops={plantWater}
            bloomCount={bloomCount}
            pendingDrops={pendingDrops}
            isActive
            onWater={onWater}
            compact
            language={language}
          />
        ) : (
          <View style={styles.choosePlantCard}>
            <View style={styles.choosePlantIcon}><AppMark size={52} /></View>
            <Text style={styles.choosePlantTitle}>{t(language, 'chooseFirstPlant')}</Text>
            <Text style={styles.choosePlantText}>
              {t(language, 'chooseFirstPlantText')}
            </Text>
            <Pressable style={styles.waterButton} onPress={onChoosePlant}>
              <Text style={styles.waterButtonText}>{t(language, 'choosePlant')}</Text>
            </Pressable>
          </View>
        )}

        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onGarden}>
          <Text style={styles.secondaryButtonText}>
            {t(language, 'myGarden')}{collectionCount > 0 ? ` (${collectionCount})` : ''}
          </Text>
        </Pressable>

        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onHistory}>
          <Text style={styles.secondaryButtonText}>
            {t(language, 'history')}{sessionsCount > 0 ? ` (${sessionsCount})` : ''}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
