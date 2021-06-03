#define LGFX_AUTODETECT

#include <LovyanGFX.hpp>

static LGFX lcd;

RTC_DATA_ATTR int bootCount = 0;  // 起動回数を保持（deepsleepしても値は消えない）

void setup(void)
{
  switch(esp_sleep_get_wakeup_cause())
  {
  case ESP_SLEEP_WAKEUP_EXT0 :
  case ESP_SLEEP_WAKEUP_EXT1 :
  case ESP_SLEEP_WAKEUP_TIMER :
  case ESP_SLEEP_WAKEUP_TOUCHPAD :
  case ESP_SLEEP_WAKEUP_ULP :
    lcd.init_without_reset(); // deep sleep からの復帰時はinit_without_resetを呼び出す。
    break;

  default :
    lcd.init();            // 通常起動時はinitを呼び出す。
    lcd.clear(TFT_WHITE);
    lcd.clear(TFT_BLACK);
    lcd.startWrite();      // 背景を描画しておく
    lcd.setColorDepth(24);
    lcd.setAddrWindow(0, 0, lcd.width(), lcd.height());
    for (int y = 0; y < lcd.height(); ++y)
      for (int x = 0; x < lcd.width(); ++x)
        lcd.writePixel(x, y, lcd.color888(x << 1, x + y, y << 1));
    lcd.endWrite();
    break;
  }

  ++bootCount;
  lcd.setCursor(bootCount*6, bootCount*8);
  lcd.setTextColor(TFT_WHITE, TFT_BLACK);
  lcd.print("DeepSleep test : " + String(bootCount));
  lcd.setCursor(bootCount*6, bootCount*8);
  lcd.setTextColor(TFT_BLACK, TFT_WHITE);
  lcd.print("DeepSleep test : " + String(bootCount));

  lcd.partialOn(); // power saving.

  auto gpio_rst = (gpio_num_t)lcd.getPanel()->gpio_rst;
  if (gpio_rst >= 0) {
    // RSTピンをRTC_GPIOで管理しhigh状態を維持する
    rtc_gpio_set_level(gpio_rst, 1);
    rtc_gpio_set_direction(gpio_rst, RTC_GPIO_MODE_OUTPUT_ONLY);
    rtc_gpio_init(gpio_rst);
    esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_ON);
  }

  auto gpio_bl = (gpio_num_t)lcd.getPanel()->gpio_bl;
  if (gpio_bl >= 0) {
    // BackLightピンをRTC_GPIOで管理しhigh状態を維持する
    rtc_gpio_set_level(gpio_bl, 1);
    rtc_gpio_set_direction(gpio_bl, RTC_GPIO_MODE_OUTPUT_ONLY);
    rtc_gpio_init(gpio_bl);
    esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_ON);
  }

  esp_sleep_enable_timer_wakeup(1 * 1000 * 1000); // micro sec

  esp_deep_sleep_start();
}

void loop(void)
{
  delay(10000);
}
