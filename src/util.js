function add(a, b) {
  return a + b;
}

function max(a, b) {
  return Math.max(a, b);
}

function weekStart(currentMillis) {
  var original = new Date(currentMillis);
  var midnight = new Date(original.setHours(0,0,0,0));
  var offset = midnight.getDay();
  var sundayMidnight = midnight.addDays((-1)*offset);
  return sundayMidnight.getTime();
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

export default {
  add,
  max,
  weekStart
};