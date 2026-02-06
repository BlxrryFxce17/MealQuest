import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

interface MealDetail {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strArea: string;
    strCategory: string;
    strInstructions: string;
    [key: string]: any;
}

export default function RecipeDetailScreen({ route, navigation }: Props) {
    const { idMeal } = route.params;
    const [meal, setMeal] = useState<MealDetail | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchMeal = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`
            );
            const json = await res.json();
            setMeal(json.meals?.[0] || null);
        } catch {
            setMeal(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeal();
    }, [idMeal]);

    const getIngredients = () => {
        if (!meal) return [];
        const ingredients: { ingredient: string; measure: string }[] = [];
        for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const meas = meal[`strMeasure${i}`];
            if (ing && ing.trim()) {
                ingredients.push({ ingredient: ing, measure: meas || '' });
            }
        }
        return ingredients;
    };

    const getSteps = () => {
        if (!meal?.strInstructions) return [];
        // Split only on newlines so we don't break "1." etc.
        return meal.strInstructions
            .split(/\r?\n/)
            .map(s => s.trim())
            .filter(Boolean);
    };

    if (loading || !meal) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#f97316" />
            </View>
        );
    }

    const ingredients = getIngredients();
    const steps = getSteps();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Top bar with back */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={18} color="#e5e7eb" />
                </TouchableOpacity>
                <Text style={styles.topTitle} numberOfLines={1}>
                    {meal.strMeal}
                </Text>
                <View style={{ width: 32 }} />
            </View>

            <Image source={{ uri: meal.strMealThumb }} style={styles.image} />

            <View style={styles.header}>
                <Text style={styles.title}>{meal.strMeal}</Text>
                <Text style={styles.meta}>
                    {meal.strCategory} · {meal.strArea}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.card}>
                {ingredients.map((item, index) => (
                    <View key={index} style={styles.ingredientRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ingredientText}>
                            {item.ingredient}{' '}
                            <Text style={styles.measure}>({item.measure})</Text>
                        </Text>
                    </View>
                ))}
                {ingredients.length === 0 && (
                    <Text style={styles.emptyText}>No ingredient data available.</Text>
                )}
            </View>

            <Text style={styles.sectionTitle}>Steps</Text>
            <View style={styles.card}>
                {steps.length > 0 ? (
                    steps.map((step, index) => (
                        <View key={index} style={styles.stepRow}>
                            <View style={styles.stepBadge}>
                                <Text style={styles.stepBadgeText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No instructions available.</Text>
                )}
            </View>

            <View style={{ height: 24 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#020617',
    },

    topBar: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        color: '#e5e7eb',
        fontSize: 22,
        fontWeight: '600',
        top: -4,
    },
    topTitle: {
        flex: 1,
        marginHorizontal: 8,
        color: '#f9fafb',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },

    image: {
        width: '100%',
        height: 230,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },

    header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    title: { color: '#f9fafb', fontSize: 22, fontWeight: '700' },
    meta: { color: '#9CA3AF', marginTop: 4, fontSize: 13 },

    sectionTitle: {
        color: '#f97316',
        fontSize: 18,
        fontWeight: '700',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 6,
    },
    card: {
        backgroundColor: '#0b1120',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1f2937',
    },

    ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    bullet: { color: '#f97316', marginRight: 6 },
    ingredientText: { color: '#e5e7eb', fontSize: 14 },
    measure: { color: '#9CA3AF', fontSize: 13 },

    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    stepBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f97316',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    stepBadgeText: {
        color: '#111827',
        fontWeight: '700',
        fontSize: 13,
    },
    stepText: {
        flex: 1,
        color: '#e5e7eb',
        fontSize: 14,
        lineHeight: 20,
    },

    emptyText: { color: '#9CA3AF', fontSize: 13 },
});
