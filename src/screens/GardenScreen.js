import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GardenCard } from '../components/GardenCard';
import { AppMark } from '../components/GardenVisuals';
import { styles } from '../styles';
import { getPlant, getPlantStage } from '../utils';
import { t } from '../i18n';

export function GardenScreen({
  language,
  gardenPlants,
  activeGardenPlantId,
  pendingDrops,
  pendingRewardPlantId,
  onBack,
  onChoosePlant,
  onSelectPlant,
  onWater,
}) {
  const totalBloomCount = gardenPlants.reduce(
    (total, gardenPlant) => total + (gardenPlant.bloomCount || 0),
    0,
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <View style={styles.contentFrame}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack}>
          <Text style={styles.backButton}>{t(language, 'back')}</Text>
        </Pressable>

        <Text style={styles.pageTitle}>{t(language, 'myGarden')}</Text>
        <Text style={styles.pageSubtitle}>
          {t(language, 'gardenSubtitle')}
        </Text>

        <View style={styles.gardenSummaryStrip}>
          <View>
            <Text style={styles.cardLabel}>{t(language, 'totalBlooms')}</Text>
            <Text style={styles.gardenSummaryValue}>{totalBloomCount}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>{t(language, 'flowerBeds')}</Text>
            <Text style={styles.gardenSummaryValue}>{gardenPlants.length}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose or create a flower bed"
            style={styles.addBedButton}
            onPress={onChoosePlant}
          >
            <Text style={styles.addBedButtonText}>{t(language, 'addBed')}</Text>
          </Pressable>
        </View>

        <Text style={styles.collectionTitle}>{t(language, 'flowerBeds')}</Text>
        {gardenPlants.length === 0 ? (
          <View style={styles.choosePlantCard}>
            <View style={styles.choosePlantIcon}><AppMark size={52} /></View>
            <Text style={styles.choosePlantTitle}>{t(language, 'gardenReady')}</Text>
            <Text style={styles.choosePlantText}>{t(language, 'gardenReadyText')}</Text>
            <Pressable accessibilityRole="button" style={styles.waterButton} onPress={onChoosePlant}>
              <Text style={styles.waterButtonText}>{t(language, 'chooseBed')}</Text>
            </Pressable>
          </View>
        ) : (
          gardenPlants.map((gardenPlant) => {
            const plant = getPlant(gardenPlant.plantId);
            const stage = getPlantStage(plant, gardenPlant.waterDrops);
            const isActive = gardenPlant.id === activeGardenPlantId;

            return (
              <GardenCard
                key={gardenPlant.id}
                plant={plant}
                stage={stage}
                waterDrops={gardenPlant.waterDrops}
                bloomCount={gardenPlant.bloomCount || 0}
                pendingDrops={gardenPlant.id === pendingRewardPlantId ? pendingDrops : 0}
                isActive={isActive}
                onSelect={() => onSelectPlant(gardenPlant.id)}
                onWater={onWater}
                language={language}
              />
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
