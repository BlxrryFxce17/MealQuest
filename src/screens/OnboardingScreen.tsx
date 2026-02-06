import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

type Slide = {
    title: string;
    subtitle: string;
};

const SLIDES: Slide[] = [
    {
        title: 'Welcome to MealQuest',
        subtitle: 'Search thousands of recipes by name, ingredient, or mood.',
    },
    {
        title: 'Save your favourites',
        subtitle: 'Tap “Save” on any recipe to build your personal cookbook.',
    },
    {
        title: 'Open the menu',
        subtitle: 'Use the ☰ button to access Favorites and your Profile anytime.',
    },
];

type Props = {
    onDone: () => void;
};

export default function OnboardingScreen({ onDone }: Props) {
    const scrollRef = useRef<ScrollView | null>(null);
    const [index, setIndex] = useState(0);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const newIndex = Math.round(x / width);
        if (newIndex !== index) setIndex(newIndex);
    };

    const handleNext = () => {
        if (index === SLIDES.length - 1) {
            onDone();
            return;
        }
        const next = index + 1;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        setIndex(next);
    };

    const handleSkip = () => {
        onDone();
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {SLIDES.map((slide, i) => (
                    <View key={i} style={styles.slide}>
                        <Text style={styles.appName}>MealQuest</Text>
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.subtitle}>{slide.subtitle}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.dots}>
                    {SLIDES.map((_, i) => {
                        const active = i === index;
                        return (
                            <View
                                key={i}
                                style={[styles.dot, active && styles.dotActive]}
                            />
                        );
                    })}
                </View>

                <View style={styles.buttonsRow}>
                    {index < SLIDES.length - 1 && (
                        <TouchableOpacity onPress={handleSkip} style={styles.secondaryButton}>
                            <Text style={styles.secondaryText}>Skip</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={handleNext} style={styles.primaryButton}>
                        <Text style={styles.primaryText}>
                            {index === SLIDES.length - 1 ? 'Get started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    slide: {
        width,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    appName: {
        fontSize: 16,
        letterSpacing: 2,
        color: '#9ca3af',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        color: '#f97316',
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#e5e7eb',
        lineHeight: 22,
    },

    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4b5563',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#f97316',
        width: 18,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    secondaryButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#4b5563',
    },
    secondaryText: {
        color: '#e5e7eb',
        fontSize: 14,
        fontWeight: '500',
    },
    primaryButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 999,
        backgroundColor: '#f97316',
    },
    primaryText: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '600',
    },
});
