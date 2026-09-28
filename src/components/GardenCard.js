import { Pressable, Text, View } from 'react-native';
import { PlantVisual, VisitorVisual } from './GardenVisuals';
import { styles } from '../styles';
import { waterPerBloom } from '../constants';
import { getBedLevelInfo } from '../utils';
import { plantLabel, t } from '../i18n';

export function GardenCard({
  plant,
  stage,
  waterDrops,
  bloomCount = 0,
  pendingDrops = 0,
  onWater,
  isActive = false,
  onSelect,
  compact = false,
  language = 'en',
}) {
  const bedLevel = getBedLevelInfo(bloomCount);
  const isLevelTwo = bedLevel.levelNumber === 2;
  const isLevelThree = bedLevel.levelNumber === 3;
  const visibleBloomIcons = Array.from({
    length: bedLevel.bloomsInCurrentLevel,
  });
  const localizedPlantName = plantLabel(language, plant.name);
  const bedTitle = language === 'zh-TW'
    ? `${bedLevel.isGolden ? 'Golden ' : ''}${localizedPlantName}花圃 ${bedLevel.isGolden ? '' : bedLevel.label}`
    : bedLevel.isGolden
      ? `Golden ${plant.name} Bed`
      : `${plant.name} Bed ${bedLevel.label}`;
  const flowersPerCluster = bedLevel.levelNumber === 1 ? 1 : 2;
  const clusterFlowers = Array.from({ length: flowersPerCluster });
  const flowerWaterGoal = waterPerBloom;
  const flowerProgress = Math.min(100, (waterDrops / flowerWaterGoal) * 100);
  const bedProgress = bedLevel.isGolden
    ? (bedLevel.unlockedVisitors.length / 5) * 100
    : (bedLevel.bloomsInCurrentLevel / bedLevel.bloomsPerLevel) * 100;
  const bedProgressText = bedLevel.isGolden
    ? language === 'zh-TW'
      ? `${bedLevel.unlockedVisitors.length}/5 ${t(language, 'visitors')}`
      : `${bedLevel.unlockedVisitors.length}/5 ${t(language, 'visitors')}`
    : bedLevel.bloomsInCurrentLevel >= bedLevel.bloomsPerLevel
      ? language === 'zh-TW'
        ? `${bedLevel.bloomsPerLevel}/${bedLevel.bloomsPerLevel} 個位置已填滿 • 下一朵解鎖 ${bedLevel.levelNumber === 3 ? 'Golden' : `Lv.${bedLevel.levelNumber + 1}`}`
        : `${bedLevel.bloomsPerLevel}/${bedLevel.bloomsPerLevel} slots filled • Next bloom unlocks ${bedLevel.levelNumber === 3 ? 'Golden' : `Lv.${bedLevel.levelNumber + 1}`}`
      : language === 'zh-TW'
        ? `${bedLevel.bloomsInCurrentLevel}/${bedLevel.bloomsPerLevel} ${t(language, 'gardenSlots')}`
        : `${bedLevel.bloomsInCurrentLevel}/${bedLevel.bloomsPerLevel} ${t(language, 'gardenSlots')}`;

  return (
    <View style={[
      styles.gardenCard,
      compact && styles.compactGardenCard,
      bedLevel.isGolden && styles.goldenGardenCard,
    ]}>
      <View
        style={[
          styles.gardenScene,
          compact && styles.compactGardenScene,
          isLevelTwo && styles.gardenSceneLevelTwo,
          isLevelThree && styles.gardenSceneLevelThree,
          bedLevel.isGolden && styles.gardenSceneGolden,
        ]}
      >
        <View style={[styles.gardenSun, bedLevel.isGolden && styles.gardenSunGolden]} />
        {isLevelThree && (
          <View style={styles.sceneDecorRow}>
            <Text style={styles.sceneDecor}>✿</Text>
            <Text style={styles.sceneDecor}>·</Text>
            <Text style={styles.sceneDecor}>✿</Text>
          </View>
        )}
        <View style={styles.flowerBedPlants}>
          {Array.from({ length: bedLevel.bloomsPerLevel }).map((_, index) => {
            const hasBloom = index < visibleBloomIcons.length;
            const isCurrentPlant = !bedLevel.isGolden && index === visibleBloomIcons.length;

            return (
              <View
                key={`${plant.id}-scene-slot-${index}`}
                style={[
                  styles.flowerCluster,
                  bedLevel.isGolden && styles.flowerClusterGolden,
                ]}
              >
                {hasBloom && (
                  <View style={styles.flowerClusterBlooms}>
                    {clusterFlowers.map((_, flowerIndex) => (
                      <View
                        key={`${plant.id}-cluster-${index}-flower-${flowerIndex}`}
                        style={[
                          styles.flowerClusterBloom,
                          isLevelThree && styles.flowerClusterBloomLevelThree,
                          bedLevel.isGolden && styles.flowerClusterBloomGolden,
                        ]}
                      >
                        <PlantVisual plantId={plant.id} stageIndex={4} size={30} />
                      </View>
                    ))}
                  </View>
                )}
                {isCurrentPlant && (
                  <PlantVisual plantId={plant.id} stageIndex={stage.index} size={44} />
                )}
                {bedLevel.isGolden && bedLevel.unlockedVisitors[index] && (
                  <View style={styles.goldenVisitor}>
                    <VisitorVisual type={bedLevel.unlockedVisitors[index]} size={25} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View
          style={[
            styles.gardenGround,
            bedLevel.isGolden && styles.gardenGroundGolden,
          ]}
        />
      </View>

      <View style={styles.gardenInfo}>
        <View style={styles.gardenTitleRow}>
          <Text style={styles.gardenTitle}>{bedTitle}</Text>
          <View style={styles.badgeRow}>
            {bedLevel.isGolden && <Text style={styles.goldenPlantBadge}>{t(language, 'golden')}</Text>}
            {isActive && <Text style={styles.activePlantBadge}>{t(language, 'active')}</Text>}
          </View>
        </View>
        <View style={styles.growthSection}>
          <View style={styles.growthLabelRow}>
            <Text style={styles.growthLabel}>{t(language, 'flowerGrowth')}</Text>
            <Text style={styles.growthValue}>{t(language, 'stage')} {stage.number}/{stage.totalStages}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${flowerProgress}%` }]} />
          </View>
          <Text style={styles.gardenProgressText}>
            {waterDrops}/{flowerWaterGoal} {language === 'zh-TW' ? '滴' : 'drops'}
            {stage.isComplete
              ? ` • ${stage.remainingDrops} ${t(language, 'toBloom')}`
              : ` • ${stage.remainingDrops} ${t(language, 'nextStage')}`}
          </Text>
        </View>

        {!compact && <View style={styles.growthSection}>
          <View style={styles.growthLabelRow}>
            <Text style={styles.growthLabel}>{t(language, 'flowerBed')}</Text>
            <Text style={styles.growthValue}>
              {bedLevel.isGolden ? t(language, 'golden') : bedLevel.label}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.bedProgressFill, { width: `${bedProgress}%` }]} />
          </View>
          <Text style={styles.gardenProgressText}>
            {bedProgressText}
          </Text>
        </View>}

        {pendingDrops > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Use ${pendingDrops} water drops on ${plant.name} bed`}
            style={styles.waterButton}
            onPress={onWater}
          >
            <Text style={styles.waterButtonText}>
              {language === 'zh-TW'
                ? `使用 ${pendingDrops} 滴水澆這個花圃`
                : `Use ${pendingDrops} water ${pendingDrops === 1 ? 'drop' : 'drops'} on this bed`}
            </Text>
          </Pressable>
        )}

        {onSelect && !isActive && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Set ${plant.name} bed as active`}
            style={styles.smallSecondaryButton}
            onPress={onSelect}
          >
            <Text style={styles.smallSecondaryButtonText}>
              {language === 'zh-TW' ? '設為使用中的花圃' : 'Set as active flower bed'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
