// Normalize a JS Date to midnight (local timezone)
function normalize(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Return { today, tomorrow } normalized
function getTodayRange() {
  const today = normalize(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return { today, tomorrow };
}

module.exports = { normalize, getTodayRange };
