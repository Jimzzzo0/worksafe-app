import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 隱藏上方預設標題列與底部分頁列
        animation: 'fade',  // 換頁時使用柔和淡入淡出效果
      }}
    />
  );
}