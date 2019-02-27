const timesFun = (time) => {
  const dateBegin = new Date(time.replace(/-/g, "/"));
  const dateNow = new Date();
  const dateDiff = dateNow - dateBegin;
  const dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));
  const hoursDiff = Math.floor(dateDiff / (3600 * 1000));
  const minDiff = Math.floor(dateDiff / (60 * 1000));
  const secDiff = Math.floor(dateDiff / 1000);
  let str = '';
  str = dayDiff == 0 ? hoursDiff == 0 ? minDiff == 0 ? secDiff == 0 ? '刚刚': `${secDiff}秒前`: `${minDiff}分前`: `${hoursDiff}时前`: `${dayDiff}天前`;
  return str;
}
module.exports = {
  timesFun,
}