import test from 'node:test';
import assert from 'node:assert/strict';
import {
  updateTemperatureV2,
  cleanRoofAndCool,
  isLevelCompleted,
  evaluateGameStatusV2,
  validateWasteSorting,
  generateBuildingTrashItems,
  LEVELS,
  INITIAL_CONFIG_V2
} from './rules';

test('updateTemperatureV2 increases temperature based on level rate', () => {
  const current = 30;
  const level1Rate = LEVELS[0].tempIncreaseRate; // 2.0
  const next = updateTemperatureV2(current, 1.0, level1Rate);
  assert.equal(next, 32);

  const level2Rate = LEVELS[1].tempIncreaseRate; // 2.8
  const nextL2 = updateTemperatureV2(current, 1.0, level2Rate);
  assert.equal(nextL2, 32.8);
});

test('cleanRoofAndCool reduces temperature by 15 points and clamps to 0', () => {
  const current = 40;
  const cooled = cleanRoofAndCool(current, 15);
  assert.equal(cooled, 25);

  const lowTemp = 10;
  const clampedZero = cleanRoofAndCool(lowTemp, 15);
  assert.equal(clampedZero, 0);
});

test('isLevelCompleted validates required roof threshold', () => {
  assert.equal(isLevelCompleted(4, 5), false);
  assert.equal(isLevelCompleted(5, 5), true);
  assert.equal(isLevelCompleted(6, 5), true);
});

test('evaluateGameStatusV2 signals game over if temp reaches 100', () => {
  const status = evaluateGameStatusV2(100, 45, 0, 3);
  assert.equal(status.isGameOver, true);
  assert.equal(status.isVictory, false);
});

test('evaluateGameStatusV2 signals level advance on Level 1 completion', () => {
  const status = evaluateGameStatusV2(35, 45, 0, 5);
  assert.equal(status.shouldAdvanceLevel, true);
  assert.equal(status.isVictory, false);
});

test('evaluateGameStatusV2 signals ultimate victory on final Level 2 completion', () => {
  const status = evaluateGameStatusV2(40, 20, 1, 9);
  assert.equal(status.shouldAdvanceLevel, false);
  assert.equal(status.isVictory, true);
});

test('validateWasteSorting checks category equivalence', () => {
  assert.equal(validateWasteSorting('plastic', 'plastic'), true);
  assert.equal(validateWasteSorting('paper', 'paper'), true);
  assert.equal(validateWasteSorting('plastic', 'paper'), false);
  assert.equal(validateWasteSorting('organic', 'metal'), false);
});

test('generateBuildingTrashItems generates 5 items with coordinates', () => {
  const items = generateBuildingTrashItems(0);
  assert.equal(items.length, 5);
  assert.equal(items[0].category, 'plastic');
  assert.ok(items[0].xPercent > 0 && items[0].xPercent < 100);
});

