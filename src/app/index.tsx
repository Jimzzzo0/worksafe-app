import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type Gender = 'female' | 'male';

// 1. 具備實體下沉手感與震動回饋的像素按鈕元件
function PixelButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    setPressed(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    setPressed(false);
  };

  return (
    <View style={styles.buttonShadowWrapper}>
      {/* 底部像素硬陰影 */}
      <View style={styles.buttonHardShadow} />
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.pixelButton,
          // 按下時實體往下位移 4px，模擬按下按鈕的物理手感
          pressed && { transform: [{ translateY: 4 }], backgroundColor: '#F1F5F9' },
        ]}
      >
        <Text style={styles.pixelButtonText}>{label}</Text>
      </Pressable>
    </View>
  );
}

export default function StartScreen() {
  // 動態取得手機或平板螢幕尺寸
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  const [selectedGender, setSelectedGender] = useState<Gender>('female');
  const [animFrame, setAnimFrame] = useState<0 | 1>(0);
  const [infoVisible, setInfoVisible] = useState(false);

  // 2. 資料夾與紅色三角形的上下漂浮動畫值 (UI Thread)
  const folderOffsetY = useSharedValue(0);
  const arrowOffsetY = useSharedValue(0);

  useEffect(() => {
    // 資料夾柔和上下浮動
    folderOffsetY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // 紅色指示三角形輕快跳動
    arrowOffsetY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 450, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 450, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // 3. 角色兩個動作影格循環替換 (每 450ms 切換一次)
    const interval = setInterval(() => {
      setAnimFrame((prev) => (prev === 0 ? 1 : 0));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const folderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: folderOffsetY.value }],
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowOffsetY.value }],
  }));

  const handleSelectCharacter = (gender: Gender) => {
    if (selectedGender !== gender) {
      setSelectedGender(gender);
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 自適應容器：在平板上限制最大寬度並置中，避免版面過度拉伸 */}
      <View
        style={[
          styles.responsiveContainer,
          {
            maxWidth: isTablet ? 480 : 400,
            paddingVertical: height < 700 ? 16 : 32,
          },
        ]}
      >
        {/* 頂部區域：會動的主視覺資料夾 + 標題 */}
        <View style={styles.headerSection}>
          <Animated.View style={folderAnimatedStyle}>
            <Image
              source={require('../../assets/pixel/folder.png')}
              style={styles.folderImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.titleText}>Work Safe</Text>
          <Text style={styles.subtitleText}>雇主違法裁罰查詢雷達</Text>
        </View>

        {/* 中間區域：三顆具備按壓回饋的像素按鈕 */}
        <View style={styles.menuSection}>
          <PixelButton
            label="start"
            onPress={() => {
              // 下一步：導向公司查詢頁面並帶入 selectedGender
              console.log('開始查詢，目前選擇角色：', selectedGender);
            }}
          />
          <PixelButton
            label="history"
            onPress={() => console.log('開啟查詢紀錄')}
          />
          <PixelButton
            label="donate"
            onPress={() => console.log('開啟贊助與支持頁面')}
          />
        </View>

        {/* 底部區域：雙動作待機動畫 + 男女角色切換 */}
        <View style={styles.characterSection}>
          <Text style={styles.selectHintText}>點擊角色切換調查員</Text>
          <View style={styles.characterRow}>
            {/* 女生角色選項 */}
            <Pressable
              onPress={() => handleSelectCharacter('female')}
              style={styles.characterSlot}
            >
              <View style={styles.arrowPlaceholder}>
                {selectedGender === 'female' && (
                  <Animated.Text style={[styles.redArrow, arrowAnimatedStyle]}>
                    ▼
                  </Animated.Text>
                )}
              </View>
              <Image
                source={
                  animFrame === 0
                    ? require('../../assets/pixel/girl_1.png')
                    : require('../../assets/pixel/girl_2.png')
                }
                style={[
                  styles.characterSprite,
                  selectedGender === 'female'
                    ? styles.characterSelected
                    : styles.characterUnselected,
                ]}
                resizeMode="contain"
              />
            </Pressable>

            {/* 男生角色選項 */}
            <Pressable
              onPress={() => handleSelectCharacter('male')}
              style={styles.characterSlot}
            >
              <View style={styles.arrowPlaceholder}>
                {selectedGender === 'male' && (
                  <Animated.Text style={[styles.redArrow, arrowAnimatedStyle]}>
                    ▼
                  </Animated.Text>
                )}
              </View>
              <Image
                source={
                  animFrame === 0
                    ? require('../../assets/pixel/boy_1.png')
                    : require('../../assets/pixel/boy_2.png')
                }
                style={[
                  styles.characterSprite,
                  selectedGender === 'male'
                    ? styles.characterSelected
                    : styles.characterUnselected,
                ]}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* 右下角資訊 (i) 按鈕 */}
      <Pressable
        style={styles.infoButton}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setInfoVisible(true);
        }}
      >
        <Text style={styles.infoButtonText}>i</Text>
      </Pressable>

      {/* 點擊 i 彈出的專題說明視窗 */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>關於 Work Safe</Text>
            <Text style={styles.modalBody}>
              資料來源：勞動部違反勞動法令事業單位（雇主）查詢系統與經濟部商業登記資料庫。
            </Text>
            <PixelButton label="close" onPress={() => setInfoVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  folderImage: {
    width: 190,
    height: 150,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#111827',
    marginTop: 8,
    // 像素字體陰影感
    textShadowColor: '#CBD5E1',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    letterSpacing: 1,
  },
  menuSection: {
    width: '100%',
    gap: 18,
    alignItems: 'center',
  },
  buttonShadowWrapper: {
    width: '82%',
    height: 48,
    position: 'relative',
  },
  buttonHardShadow: {
    position: 'absolute',
    top: 4,
    left: 3,
    right: -3,
    bottom: -4,
    backgroundColor: '#94A3B8',
    borderRadius: 24,
  },
  pixelButton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#111827',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 1.5,
  },
  characterSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  selectHintText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  characterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
  },
  characterSlot: {
    alignItems: 'center',
  },
  arrowPlaceholder: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redArrow: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '900',
  },
  characterSprite: {
    width: 68,
    height: 84,
  },
  characterSelected: {
    opacity: 1,
    transform: [{ scale: 1.06 }],
  },
  characterUnselected: {
    opacity: 0.55,
    transform: [{ scale: 0.96 }],
  },
  infoButton: {
    position: 'absolute',
    right: 22,
    bottom: 26,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  infoButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D4ED8',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalBody: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
});