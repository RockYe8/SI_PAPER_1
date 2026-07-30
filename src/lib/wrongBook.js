export const WRONG_BOOK_STORAGE_KEY = "hksi-paper-1-wrong-book";
export const WRONG_BOOK_STATUS = {
  WRONG: "wrong",
  RECENTLY_CORRECT: "recently_correct",
};

export function isRecentlyCorrect(record) {
  return record.latestStatus === WRONG_BOOK_STATUS.RECENTLY_CORRECT;
}

function recordKey(batchId, questionNumber) {
  return `${batchId}:${questionNumber}`;
}

export function updateWrongBookFromResult({
  existingRecords,
  batchId,
  submittedAt,
  resultItems,
}) {
  const recordsByKey = new Map(
    existingRecords.map((record) => [recordKey(record.batchId, record.questionNumber), record]),
  );

  for (const item of resultItems) {
    const key = recordKey(batchId, item.number);
    const existing = recordsByKey.get(key);

    if (!item.isCorrect) {
      recordsByKey.set(key, {
        batchId,
        questionNumber: item.number,
        wrongCount: (existing?.wrongCount ?? 0) + 1,
        latestSelectedOption: item.selectedOption ?? null,
        latestSubmittedAt: submittedAt,
        latestStatus: WRONG_BOOK_STATUS.WRONG,
      });
      continue;
    }

    if (existing) {
      recordsByKey.set(key, {
        ...existing,
        latestSelectedOption: item.selectedOption ?? null,
        latestSubmittedAt: submittedAt,
        latestStatus: WRONG_BOOK_STATUS.RECENTLY_CORRECT,
      });
    }
  }

  return [...recordsByKey.values()].sort((a, b) => {
    const batchCompare = a.batchId.localeCompare(b.batchId);
    if (batchCompare !== 0) return batchCompare;
    return a.questionNumber - b.questionNumber;
  });
}

export function removeWrongBookItem(records, batchId, questionNumber) {
  return records.filter(
    (record) => record.batchId !== batchId || record.questionNumber !== questionNumber,
  );
}

export function clearWrongBook() {
  return [];
}

export function readWrongBook(storage = globalThis.localStorage) {
  if (!storage) return [];

  try {
    const raw = storage.getItem(WRONG_BOOK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeWrongBook(records, storage = globalThis.localStorage) {
  if (!storage) return records;
  storage.setItem(WRONG_BOOK_STORAGE_KEY, JSON.stringify(records));
  return records;
}
