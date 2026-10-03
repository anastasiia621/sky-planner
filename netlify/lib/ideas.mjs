// Ideas for the bot: a short copy of IDEAS_* / REGIONS / CATS from site/index.html (the site has no build step, so the data is duplicated).
// When you add an idea on the site, add it here too if the bot should suggest it.

export const CATS = {
  balloon: { pop: 20, wind: 12, gust: 20 },
  atv: { pop: 40, wind: 35, hot: 35 },
  horse: { pop: 50, wind: 35, hot: 33 },
  paraglide: { pop: 30, wind: 20, gust: 30 },
  boat: { pop: 50, wind: 25, gust: 40 },
  bike: { pop: 50, wind: 30, gust: 45, hot: 32, cold: 5 },
  run: { pop: 50, wind: 40, hot: 30 },
  beach: { pop: 40, wind: 30, cool: 22 },
  walk: { pop: 50, wind: 40, hot: 34 },
  outdoor: { pop: 50, wind: 35 },
};

const FETHIYE = [
  { title: 'Пляж Олюдениз', cat: 'beach', hour: 11, why: 'Бирюзовая лагуна, вода спокойная' },
  { title: 'Полёт на параплане с Бабадага', cat: 'paraglide', hour: 10, why: 'Слабый ветер, хорошая видимость. Полёт над лагуной Олюдениз' },
  { title: 'Лодочный тур по 12 островам', cat: 'boat', hour: 10, dur: 6, why: 'Море без сильного ветра, остановки для купания в бухтах' },
  { title: 'Каньон Саклыкент', cat: 'walk', hour: 10, why: 'Сухо, тропа не скользкая. Лучше приехать к 9–10 утра' },
  { title: 'Ликийская тропа до Кабака', cat: 'walk', hour: 8, why: 'Утро без жары и дождя. Одна из самых красивых пеших троп мира' },
  { title: 'Велопрогулка до Чалыша на закате', cat: 'bike', hour: 17, why: 'Тихий вечер без дождя' },
  { title: 'Рынок Фетхие', indoor: true, weekday: 2, hour: 11, why: 'По вторникам. Крытые ряды, можно гулять и в дождь' },
  { kind: 'food', title: 'Деревенский завтрак в Каякёе', cat: 'outdoor', weekend: true, hour: 10, why: 'Турецкий «серпме» завтрак, например Senit Ekmek или Cin Bal. Приезжай до 10:00' },
  { kind: 'food', title: 'Кофе и завтрак в Köşe Kahve', indoor: true, hour: 9, dur: 1, why: 'Одно из самых высоко оценённых кафе Фетхие' },
  { kind: 'food', title: "Завтрак у моря в EY's Cafe Bistro", cat: 'outdoor', hour: 10, dur: 1, why: 'Кафе на набережной с видом на море' },
  { kind: 'food', title: 'Ужин на рыбном рынке Фетхие', indoor: true, hour: 19, why: 'Выбираешь свежую рыбу, и её готовят в кафе вокруг рынка' },
];
const CAPPADOCIA = [
  { title: 'Полёт на воздушном шаре над Гёреме', cat: 'balloon', hour: 6, why: 'Почти безветренный рассвет: шары летают только в такую погоду' },
  { title: 'Квадроциклы на закате по долинам', cat: 'atv', hour: 17, why: 'Сухо, дорога не размокнет' },
  { title: 'Конная прогулка по Долине любви', cat: 'horse', hour: 9, why: 'Утро без дождя и сильного ветра' },
  { title: 'Закат на смотровой Красной долины', cat: 'walk', hour: 17, why: 'Ясный вечер для фото' },
  { title: 'Гончарный мастер-класс в Аваносе', indoor: true, hour: 14, why: 'Занятие в помещении, хороший план на пасмурный день' },
  { title: 'Подземный город Деринкую', indoor: true, hour: 11, why: 'Под землёй всегда около +13°, погода не важна' },
  { kind: 'food', title: 'Завтрак на террасе с видом на шары', cat: 'outdoor', weekend: true, hour: 7, why: 'С террас Гёреме на рассвете видно шары' },
  { kind: 'food', title: 'Ужин в пещерном ресторане', indoor: true, hour: 19, why: 'Попробуй тести-кебаб в глиняном горшке' },
];
const ANTALYA = [
  { title: 'Пляж Коньяалты', cat: 'beach', hour: 11, why: 'Тёплое море и спокойная погода' },
  { title: 'Прогулка по старому городу Калеичи', cat: 'walk', hour: 17, why: 'Тёплый вечер без дождя' },
  { title: 'Водопады Дюден', cat: 'walk', hour: 10, why: 'Сухо, тропинки не скользкие' },
  { title: 'Канатная дорога на Тюнектепе', cat: 'outdoor', hour: 16, why: 'Хорошая видимость на закате' },
  { title: 'Археологический музей Антальи', indoor: true, hour: 12, why: 'Музей в помещении, подойдёт на дождливый день' },
  { kind: 'food', title: 'Кофе в старом городе', indoor: true, hour: 10, dur: 1, why: 'В Калеичи много маленьких кофеен во дворах старых домов' },
];
const ISTANBUL = [
  { title: 'Галатская башня', cat: 'outdoor', hour: 9, why: 'Вид на весь старый город и Босфор. В ясную погоду видно дальше всего' },
  { title: 'Прогулка по Босфору на пароме', cat: 'boat', hour: 11, why: 'Спокойная вода. Городские паромы Şehir Hatları дешевле экскурсионных' },
  { title: 'Парк Эмирган', cat: 'walk', hour: 10, why: 'Сухое утро для прогулки' },
  { title: 'Закат на Галатском мосту', cat: 'walk', hour: 18, why: 'Ясный вечер без дождя' },
  { title: 'Айя-София', indoor: true, hour: 9, why: 'Внутри, можно идти в любую погоду' },
  { title: 'Цистерна Базилика', indoor: true, hour: 9, why: 'Подземное водохранилище с колоннами, прохладно в любую погоду' },
  { title: 'Гранд-базар', indoor: true, hour: 13, closed: [0], why: 'Крытый рынок, погода не важна. По воскресеньям закрыт' },
  { kind: 'food', title: 'Завтрак в Бешикташе', weekend: true, indoor: true, hour: 10, why: 'Улица завтраков: десятки кафе с турецким завтраком' },
];
export const GENERIC = [
  { title: 'Велопрогулка', cat: 'bike', hour: 10, why: 'Сухо и не ветрено' },
  { title: 'Пикник в парке', cat: 'outdoor', hour: 13, why: 'Без дождя' },
  { title: 'Долгая прогулка по городу', cat: 'walk', hour: 16, why: 'Комфортная погода' },
  { title: 'Музей или выставка', indoor: true, hour: 13, why: 'Занятие в помещении на дождливый день' },
  { kind: 'food', title: 'Новая кофейня', indoor: true, hour: 10, dur: 1, why: 'Попробуй место, где ещё не была: посмотри рейтинг и отзывы на карте' },
  { kind: 'food', title: 'Неспешный завтрак в выходной', weekend: true, indoor: true, hour: 10, why: 'Выбери кафе с хорошими отзывами о завтраках' },
];

export const REGIONS = [
  { name: 'Фетхие', lat: 36.62, lon: 29.12, radius: 45, ideas: FETHIYE },
  { name: 'Каппадокия', lat: 38.64, lon: 34.83, radius: 80, ideas: CAPPADOCIA },
  { name: 'Анталья', lat: 36.89, lon: 30.70, radius: 50, ideas: ANTALYA },
  { name: 'Стамбул', lat: 41.01, lon: 28.98, radius: 50, ideas: ISTANBUL },
];
