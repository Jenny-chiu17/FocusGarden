import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { plants } from '../constants';
import { styles } from '../styles';
import { getBedLevelInfo, getPlantStage } from '../utils';
import { PlantVisual } from '../components/GardenVisuals';
import { plantLabel, t } from '../i18n';

export function PlantSelectionScreen({ language, gardenPlants, onBack, onChoose }) {
  function getFlowerBed(plantId) {
    return gardenPlants.find((gardenPlant) => gardenPlant.plantId === plantId);
  }

  return (
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

        <Text style={styles.pageTitle}>{t(language, 'chooseBedTitle')}</Text>
        <Text style={styles.pageSubtitle}>
          {t(language, 'chooseBedSubtitle')}
        </Text>

        <View style={styles.plantChoiceList}>
          {plants.map((plant) => {
            const flowerBed = getFlowerBed(plant.id);
            const stage = flowerBed ? getPlantStage(plant, flowerBed.waterDrops) : null;
            const bedLevel = flowerBed ? getBedLevelInfo(flowerBed.bloomCount || 0) : null;

            return (
              <Pressable
                key={plant.id}
                accessibilityRole="button"
                accessibilityLabel={`${plant.name} flower bed`}
                style={styles.plantChoiceCard}
                onPress={() => onChoose(plant.id)}
              >
                <View style={[styles.plantChoiceIcon, { backgroundColor: plant.color }]}>
                  <PlantVisual
                    plantId={plant.id}
                    stageIndex={stage ? stage.index : 4}
                    size={38}
                  />
                </View>
                <View style={styles.plantChoiceInfo}>
                  <Text style={styles.plantChoiceName}>
                    {language === 'zh-TW'
                      ? `${bedLevel?.isGolden ? 'Golden ' : ''}${plantLabel(language, plant.name)}花圃`
                      : bedLevel?.isGolden ? `Golden ${plant.name} Bed` : `${plant.name} Bed`}
                  </Text>
                  <Text style={styles.plantChoiceText}>
                    {flowerBed
                      ? language === 'zh-TW'
                        ? `${bedLevel.label} • ${t(language, 'bloomed')} ${flowerBed.bloomCount || 0} ${t(language, 'times')} • ${t(language, 'stage')} ${stage.number}/${stage.totalStages}`
                        : `${bedLevel.label} • ${t(language, 'bloomed')} ${flowerBed.bloomCount || 0} ${t(language, 'times')} • ${t(language, 'stage')} ${stage.number}/${stage.totalStages}`
                      : t(language, 'createBed')}
                  </Text>
                </View>
                <Text style={styles.plantChoiceArrow}>›</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
