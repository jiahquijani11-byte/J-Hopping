import { router } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const slides = [
  {
    image: require("../assets/images/corousel11.png"),
    title: "J-Hopping",
    subtitle: "Find your next stop with a smoother, brighter start.",
  },
  {
    image: require("../assets/images/corousel12.png"),
    title: "Hop In",
    subtitle: "Sign in to continue and start exploring your journey.",
  },
];

export default function Index() {
  const { height, width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState(() => new Set([0]));
  const carouselRef = useRef<ScrollView>(null);

  const preloadRemainingSlides = () => {
    setLoadedSlides((currentSlides) => {
      if (currentSlides.size === slides.length) return currentSlides;

      return new Set(slides.map((_, index) => index));
    });
  };

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      preloadRemainingSlides();
      requestAnimationFrame(() => {
        carouselRef.current?.scrollTo({
          x: width * (activeSlide + 1),
          animated: true,
        });
        setActiveSlide(activeSlide + 1);
      });
      return;
    }

    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" style="light" translucent />
      <ScrollView
        ref={carouselRef}
        style={styles.carousel}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={preloadRemainingSlides}
        onMomentumScrollEnd={(event) => {
          const nextSlide = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveSlide(nextSlide);
        }}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View
            key={slide.title}
            style={[styles.slide, { height, width }]}
          >
            <Image
              cachePolicy="memory-disk"
              contentFit="cover"
              priority={index === activeSlide ? "high" : "normal"}
              source={loadedSlides.has(index) ? slide.image : null}
              onLoadEnd={index === 0 ? preloadRemainingSlides : undefined}
              style={StyleSheet.absoluteFill}
              transition={0}
            />
            <View style={styles.overlay} />
            <SafeAreaView style={styles.content}>
              <View style={styles.heroText}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
              </View>
            </SafeAreaView>
          </View>
        ))}
      </ScrollView>

      <SafeAreaView style={styles.controls}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View
              key={slide.title}
              style={[styles.dot, activeSlide === index && styles.activeDot]}
            />
          ))}
        </View>

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {activeSlide === slides.length - 1 ? "Go to Login" : "Next"}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  carousel: {
    flex: 1,
  },
  slide: {
    backgroundColor: "#111827",
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 18, 32, 0.42)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 150,
  },
  heroText: {
    maxWidth: 520,
  },
  title: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "800",
    lineHeight: 52,
  },
  subtitle: {
    color: "#eef2ff",
    fontSize: 18,
    lineHeight: 27,
    marginTop: 12,
  },
  controls: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
    pointerEvents: "box-none",
    position: "absolute",
    right: 0,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 22,
  },
  dot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activeDot: {
    backgroundColor: "#ffffff",
    width: 28,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.22)",
    borderRadius: 8,
    minHeight: 54,
    justifyContent: "center",
  },
  buttonText: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700",
  },
});
