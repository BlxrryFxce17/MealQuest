import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList, RootStackParamList } from '../../App';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const FAV_KEY = 'mealquest:favorites';

type DrawerProps = DrawerScreenProps<DrawerParamList, 'Favorites'>;
type StackProps = NativeStackScreenProps<RootStackParamList>;
type Props = DrawerProps & StackProps;

interface Meal {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strArea: string;
    strCategory: string;
}

export default function FavoritesScreen(_props: Props) {
    const navigation = useNavigation<StackProps['navigation']>();
    const [favorites, setFavorites] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);

    const loadFavoriteIds = async (): Promise<string[]> => {
        try {
            const raw = await AsyncStorage.getItem(FAV_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    };

    const fetchFavoriteMeals = async () => {
        setLoading(true);
        try {
            const ids = await loadFavoriteIds();
            if (ids.length === 0) {
                setFavorites([]);
                return;
            }

            const results: Meal[] = [];
            for (const id of ids) {
                const res = await fetch(
                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`
                );
                const json = await res.json();
                const m = json.meals?.[0];
                if (m) {
                    results.push({
                        idMeal: m.idMeal,
                        strMeal: m.strMeal,
                        strMealThumb: m.strMealThumb,
                        strArea: m.strArea,
                        strCategory: m.strCategory,
                    });
                }
            }
            setFavorites(results);
        } catch {
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchFavoriteMeals();
        });
        return unsubscribe;
    }, [navigation]);

    const onOpenMeal = (meal: Meal) => {
        navigation.navigate('RecipeDetail', {
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="chevron-back" size={18} color="#e5e7eb" />
            </TouchableOpacity>
            <Text style={styles.title}>Saved recipes</Text>
            <Text style={styles.subtitle}>Your favourites in one place</Text>

            {favorites.length === 0 && !loading && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No favourites yet</Text>
                    <Text style={styles.emptyText}>
                        Tap “Save” on any recipe to add it here.
                    </Text>
                </View>
            )}

            <FlatList
                data={favorites}
                keyExtractor={item => item.idMeal}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => onOpenMeal(item)}
                    >
                        <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
                        <View style={styles.info}>
                            <Text style={styles.cardTitle} numberOfLines={2}>
                                {item.strMeal}
                            </Text>
                            <Text style={styles.cardMeta}>
                                {item.strCategory} · {item.strArea}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617', paddingHorizontal: 16, paddingTop: 16 },
    title: { color: '#f9fafb', fontSize: 22, fontWeight: '800' },
    subtitle: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },

    emptyState: {
        backgroundColor: '#020617',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 16,
        marginTop: 16,
    },
    emptyTitle: { color: '#f9fafb', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    emptyText: { color: '#9CA3AF', fontSize: 13 },

    card: {
        flexDirection: 'row',
        backgroundColor: '#020617',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        overflow: 'hidden',
    },
    thumb: { width: 90, height: 90 },
    info: { flex: 1, paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' },
    cardTitle: { color: '#f9fafb', fontSize: 15, fontWeight: '600' },
    cardMeta: { color: '#9CA3AF', marginTop: 4, fontSize: 12 },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
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
});
