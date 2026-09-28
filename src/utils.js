import {
  bloomsPerBedLevel,
  goldenBloomRequirement,
  goldenVisitors,
  plants,
  waterPerBloom,
  waterRequirements,
} from './constants';

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatFocusedTime(totalSeconds, language = 'en') {
  if (totalSeconds < 60) {
    return language === 'zh-TW' ? `${totalSeconds} 秒` : `${totalSeconds} sec`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (language === 'zh-TW') {
    return seconds === 0 ? `${minutes} 分鐘` : `${minutes} 分 ${seconds} 秒`;
  }
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`;
}

export function getPlant(plantId) {
  return plants.find((plant) => plant.id === plantId) || null;
}

export function getPlantStage(plant, waterDrops) {
  let stageIndex = 0;
  for (let index = 0; index < waterRequirements.length; index += 1) {
    if (waterDrops >= waterRequirements[index]) stageIndex = index;
  }

  const isComplete = stageIndex === waterRequirements.length - 1;
  const nextRequirement = isComplete ? waterPerBloom : waterRequirements[stageIndex + 1];

  return {
    index: stageIndex,
    number: stageIndex + 1,
    totalStages: waterRequirements.length,
    visual: plant.stages[stageIndex],
    isComplete,
    nextRequirement,
    remainingDrops: Math.max(0, nextRequirement - waterDrops),
  };
}

export function calculateWaterReward(selectedDuration, completedSeconds) {
  const completedMinutes = Math.floor(completedSeconds / 60);

  if (completedMinutes >= 60) {
    return 8 + Math.floor((completedMinutes - 60) / 15) * 2;
  }

  if (completedMinutes >= 45) return 6;
  if (completedMinutes >= 25) return 3;
  if (completedMinutes >= 10) return 1;
  return 0;
}

export function getBedLevelInfo(bloomCount = 0) {
  const safeBloomCount = Math.max(0, bloomCount);
  const isGolden = safeBloomCount >= goldenBloomRequirement;
  const levelNumber = isGolden
    ? 4
    : safeBloomCount >= 11
      ? 3
      : safeBloomCount >= 6
        ? 2
        : 1;
  const bloomsInCurrentLevel = isGolden
    ? bloomsPerBedLevel
    : levelNumber === 3
      ? safeBloomCount - 10
      : levelNumber === 2
        ? safeBloomCount - 5
        : safeBloomCount;
  const nextLevelAt = levelNumber === 3 ? goldenBloomRequirement : levelNumber * 5 + 1;
  const bloomsUntilNextLevel = isGolden
    ? 0
    : nextLevelAt - safeBloomCount;

  return {
    isGolden,
    levelNumber,
    label: isGolden ? 'Golden Bed' : `Lv.${levelNumber}`,
    bloomsInCurrentLevel,
    bloomsUntilNextLevel,
    bloomsPerLevel: bloomsPerBedLevel,
    extraGoldenBlooms: isGolden ? safeBloomCount - goldenBloomRequirement : 0,
    unlockedVisitors: isGolden
      ? goldenVisitors.slice(0, Math.min(goldenVisitors.length, safeBloomCount - goldenBloomRequirement + 1))
      : [],
  };
}
