import fetch from 'node-fetch';

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = '7319839226:AAHKBhjR5s4MFw4E1yFl8URAyFoCrzIpQts';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Правильный URL для приложения
const APP_URL = 'https://9c531f92-c005-44b6-9262-31633dc0faf8-00-355idei9zjiw8.riker.replit.dev';

async function setupBot() {
  console.log("Настройка Telegram бота...");
  
  // 1. Проверяем информацию о боте
  try {
    const botResponse = await fetch(`${TELEGRAM_API_URL}/getMe`);
    const botData = await botResponse.json();
    
    if (botData.ok) {
      console.log(`Бот @${botData.result.username} получен успешно!`);
    } else {
      console.error("Ошибка получения информации о боте:", botData.description);
      return;
    }
    
    // 2. Устанавливаем команды бота
    const commandsResponse = await fetch(`${TELEGRAM_API_URL}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: 'Запустить бота' },
          { command: 'app', description: 'Открыть мини-приложение' },
          { command: 'help', description: 'Получить помощь' },
          { command: 'about', description: 'О приложении' }
        ]
      })
    });
    
    const commandsData = await commandsResponse.json();
    if (commandsData.ok) {
      console.log("Команды бота установлены успешно");
    } else {
      console.error("Ошибка установки команд бота:", commandsData.description);
    }
    
    // 3. Устанавливаем кнопку меню бота для Web App
    const menuResponse = await fetch(`${TELEGRAM_API_URL}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Channel Boost App',
          web_app: {
            url: APP_URL
          }
        }
      })
    });
    
    const menuData = await menuResponse.json();
    if (menuData.ok) {
      console.log("Кнопка меню Web App установлена успешно");
    } else {
      console.error("Ошибка установки кнопки меню:", menuData.description);
    }
    
    console.log("\nБот настроен успешно!");
    console.log("URL приложения:", APP_URL);
    console.log("\nТеперь пользователи могут:");
    console.log("1. Использовать кнопку меню Web App в чате с ботом");
    console.log("2. Использовать команду /app для получения кнопки с мини-приложением");
    console.log("3. Использовать команду /start для запуска бота и получения кнопки с мини-приложением");
    
  } catch (error) {
    console.error("Произошла ошибка:", error);
  }
}

// Запускаем настройку бота
setupBot();