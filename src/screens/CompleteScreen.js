import { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';
import { formatFocusedTime, getPlant } from '../utils';
import { PlantVisual } from '../components/GardenVisuals';
import { plantLabel, subjectLabel, t } from '../i18n';

export function CompleteScreen({
  language,
  subject,
  focusedSeconds,
  plant,
  gardenPlants,
  rewardGardenPlantId,
  earnedDrops,
  rewardPending,
  interruptionCount = 0,
  onChooseRewardPlant,
  onWater,
  onHome,
}) {
  const [isWatering, setIsWatering] = useState(false);
  const waterAnimation = useRef(new Animated.Value(0)).current;

  function waterSelectedBed() {
    if (isWatering) return;
    setIsWatering(true);
    waterAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(waterAnimation, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(waterAnimation, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      onWater();
      setIsWatering(false);
    });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.staticContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentFrame}>
          <View style={styles.completeContent}>
            <Animated.View
              style={[
                styles.completePlant,
                {
                  transform: [{
                    scale: waterAnimation.interpolate({
                      inputRange: [0, 0.55, 1],
                      outputRange: [1, 1.12, 1.04],
                    }),
                  }],
                },
              ]}
            >
              <PlantVisual plantId={plant?.id || 'rose'} stageIndex={4} size={64} />
              <Animated.View
                style={[
                  styles.waterDropAnimation,
                  {
                    opacity: waterAnimation,
                    transform: [{
                      translateY: waterAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 18],
                      }),
                    }],
                  },
                ]}
              />
            </Animated.View>
            <Text style={styles.completeTitle}>{t(language, 'sessionComplete')}</Text>
            <Text style={styles.completeSubject}>{subjectLabel(language, subject)}</Text>
            <Text style={styles.completeTime}>
              {formatFocusedTime(focusedSeconds, language)} {t(language, 'focused')}
            </Text>
            {interruptionCount > 0 && (
              <Text style={styles.interruptionText}>
                {t(language, 'interruptions')}: {interruptionCount}
              </Text>
            )}

            <View style={styles.completeCard}>
              <Text style={styles.rewardDrops}>
                {earnedDrops > 0
                  ? language === 'zh-TW' ? `+${earnedDrops} 滴水` : `+${earnedDrops} water`
                  : t(language, 'noWater')}
              </Text>
              <Text style={styles.completeCardText}>
                {earnedDrops > 0
                  ? rewardPending
                    ? t(language, 'chooseWaterBed')
                    : language === 'zh-TW'
                      ? `${plantLabel(language, plant?.name)}花圃已完成澆水。`
                      : `${plant?.name} has been watered.`
                  : t(language, 'minimumReward')}
              </Text>
            </View>

            {earnedDrops > 0 && rewardPending ? (
              <>
                <Text style={styles.rewardTargetLabel}>{t(language, 'waterThisBed')}</Text>
                <View style={styles.rewardTargetGrid}>
                  {gardenPlants.map((gardenPlant) => {
                    const gardenPlantInfo = getPlant(gardenPlant.plantId);
                    const isSelected = gardenPlant.id === rewardGardenPlantId;

                    return (
                      <Pressable
                        key={gardenPlant.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={`Water ${gardenPlantInfo?.name} bed`}
                        style={[
                          styles.rewardTargetButton,
                          isSelected && styles.rewardTargetButtonSelected,
                        ]}
                        onPress={() => onChooseRewardPlant(gardenPlant.id)}
                      >
                        <PlantVisual plantId={gardenPlantInfo?.id} stageIndex={4} size={30} />
                        <Text
                          style={[
                            styles.rewardTargetText,
                            isSelected && styles.rewardTargetTextSelected,
                          ]}
                        >
                          {plantLabel(language, gardenPlantInfo?.name)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  disabled={!rewardGardenPlantId || isWatering}
                  accessibilityRole="button"
                  style={[
                    styles.primaryButton,
                    (!rewardGardenPlantId || isWatering) && styles.primaryButtonDisabled,
                  ]}
                  onPress={waterSelectedBed}
                >
                  <Text style={styles.primaryButtonText}>
                    {isWatering
                      ? t(language, 'watering')
                      : language === 'zh-TW'
                        ? `澆灌${plantLabel(language, plant?.name) || '花朵'}花圃`
                        : `Water ${plant?.name || 'Flower'} Bed`}
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.primaryButton} onPress={onHome}>
                <Text style={styles.primaryButtonText}>{t(language, 'backHome')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
