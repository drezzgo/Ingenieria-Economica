import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCompoundCapitalization, calculateFrenchAmortization, calculateGermanAmortization } from './finance.ts';

test('calculateCompoundCapitalization', () => {
  const schedule = calculateCompoundCapitalization(100, 0.01, 3);
  // Period 1
  assert.equal(schedule[0].beginningBalance, 100);
  assert.equal(schedule[0].deposit, 0);
  assert.equal(schedule[0].interest, 1);
  assert.equal(schedule[0].endingBalance, 101);
  
  // Checking accounting rule
  schedule.forEach(period => {
    assert.equal(period.beginningBalance + period.deposit + period.interest, period.endingBalance);
  });
});

test('calculateFrenchAmortization last payment exact match', () => {
  const schedule = calculateFrenchAmortization(100, 0.05, 3);
  const lastPeriod = schedule[2];
  assert.equal(lastPeriod.endingBalance, 0);
  assert.equal(lastPeriod.principal, lastPeriod.beginningBalance);
});

test('calculateGermanAmortization last payment exact match', () => {
  const schedule = calculateGermanAmortization(100, 0.05, 3);
  const lastPeriod = schedule[2];
  assert.equal(lastPeriod.endingBalance, 0);
  assert.equal(lastPeriod.principal, lastPeriod.beginningBalance);
});
