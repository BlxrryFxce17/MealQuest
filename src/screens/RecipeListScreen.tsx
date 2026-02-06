import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Alert,
} from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { RootStackParamList, DrawerParamList } from '../../App';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

type DrawerProps = DrawerScreenProps<DrawerParamList, 'Recipes'>;
type StackProps = NativeStackScreenProps<RootStackParamList>;
type Props = DrawerProps & StackProps;

interface Meal {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strArea: string;
    strCategory: string;
    isFavorite?: boolean;
}

const QUICK_FILTERS = ['Popular', 'Quick', 'Indian', 'Healthy'];

const getFavKey = () => {
    const uid = auth.currentUser?.uid ?? 'guest';
    return `mealquest:favorites:${uid}`;
}

export default function RecipeListScreen(_props: Props) {
    const navigation = useNavigation<any>();

    const [query, setQuery] = useState('chicken');
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);
    const [randomMeal, setRandomMeal] = useState<Meal | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const loadFavorites = async (): Promise<string[]> => {
        try {
            const raw = await AsyncStorage.getItem(getFavKey());
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    };

    const saveFavorites = async (ids: string[]) => {
        try {
            await AsyncStorage.setItem(getFavKey(), JSON.stringify(ids));
        } catch {
            // ignore for now
        }
    };

    const fetchMeals = async (search: string, favoriteIds?: string[]) => {
        if (!search.trim()) {
            setMeals([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(search)}`
            );
            const json = await res.json();
            const favSet = new Set(favoriteIds ?? (await loadFavorites()));
            const list = (json.meals || []).map((m: any) => ({
                idMeal: m.idMeal,
                strMeal: m.strMeal,
                strMealThumb: m.strMealThumb,
                strArea: m.strArea,
                strCategory: m.strCategory,
                isFavorite: favSet.has(m.idMeal),
            }));
            setMeals(list);
        } catch {
            setMeals([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRandom = async () => {
        try {
            const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const json = await res.json();
            const m = json.meals?.[0];
            if (m) {
                setRandomMeal({
                    idMeal: m.idMeal,
                    strMeal: m.strMeal,
                    strMealThumb: m.strMealThumb,
                    strArea: m.strArea,
                    strCategory: m.strCategory,
                });
            }
        } catch {
            setRandomMeal(null);
        }
    };

    useEffect(() => {
        (async () => {
            const favIds = await loadFavorites();
            await fetchMeals(query, favIds);
            await fetchRandom();
        })();
    }, []);

    const onSearchPress = () => {
        setActiveFilter(null);
        fetchMeals(query);
    };

    const onOpenMeal = (meal: Meal) => {
        navigation.navigate('RecipeDetail', {
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
        });
    };

    const toggleFavorite = async (idMeal: string) => {
        setMeals(prev =>
            prev.map(m =>
                m.idMeal === idMeal ? { ...m, isFavorite: !m.isFavorite } : m
            )
        );
        if (randomMeal?.idMeal === idMeal) {
            setRandomMeal({ ...randomMeal, isFavorite: !randomMeal.isFavorite });
        }

        const currentIds = await loadFavorites();
        const setIds = new Set(currentIds);
        if (setIds.has(idMeal)) {
            setIds.delete(idMeal);
        } else {
            setIds.add(idMeal);
        }
        await saveFavorites(Array.from(setIds));
    };

    const onFilterPress = (label: string) => {
        setActiveFilter(label);
        const map: Record<string, string> = {
            Popular: 'chicken',
            Quick: 'salad',
            Indian: 'biryani',
            Healthy: 'salad',
        };
        const nextQuery = map[label] || 'chicken';
        setQuery(nextQuery);
        fetchMeals(nextQuery);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (e: any) {
            Alert.alert('Logout failed', e.message ?? 'Please try again.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
            {
                <View style={styles.container}>
                    {/* Top app bar */}
                    <View style={styles.topBar}>
                        <View style={styles.topLeft}>
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                            >
                                <Text style={styles.menuIcon}>☰</Text>
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.appName}>MealQuest</Text>
                                <Text style={styles.appTagline}>Discover recipes for what you have</Text>
                            </View>
                        </View>

                        <View style={styles.topRight}>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >

                        {/* Search section */}
                        <Text style={styles.greeting}>Good evening, foodie 👋</Text>
                        <Text style={styles.subtitle}>What would you like to cook today?</Text>

                        <View style={styles.searchRow}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search recipes (e.g. biryani, pasta)"
                                placeholderTextColor="#6b7280"
                                value={query}
                                onChangeText={setQuery}
                                onSubmitEditing={onSearchPress}
                            />
                            <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
                                <Text style={styles.searchButtonText}>Search</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quick filters */}
                        <View style={styles.chipRow}>
                            {QUICK_FILTERS.map(label => {
                                const active = activeFilter === label;
                                return (
                                    <TouchableOpacity
                                        key={label}
                                        style={[styles.chip, active && styles.chipActive]}
                                        onPress={() => onFilterPress(label)}
                                    >
                                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Featured random meal */}
                        {randomMeal && (
                            <TouchableOpacity
                                style={styles.featuredCard}
                                onPress={() => onOpenMeal(randomMeal)}
                            >
                                <Image source={{ uri: randomMeal.strMealThumb }} style={styles.featuredImage} />
                                <View style={styles.featuredOverlay} />
                                <View style={styles.featuredContent}>
                                    <Text style={styles.featuredLabel}>Chef’s pick</Text>
                                    <Text style={styles.featuredTitle} numberOfLines={1}>
                                        {randomMeal.strMeal}
                                    </Text>
                                    <Text style={styles.featuredMeta}>
                                        {randomMeal.strCategory} · {randomMeal.strArea}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Results header */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Results</Text>
                            {loading && <ActivityIndicator color="#f97316" size="small" />}
                        </View>

                        {!loading && meals.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyTitle}>No recipes found</Text>
                                <Text style={styles.emptyText}>
                                    Try searching for a different ingredient or cuisine.
                                </Text>
                            </View>
                        )}

                        {/* Results list */}
                        <FlatList
                            data={meals}
                            keyExtractor={item => item.idMeal}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.card} onPress={() => onOpenMeal(item)}>
                                    <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardTitle} numberOfLines={2}>
                                            {item.strMeal}
                                        </Text>
                                        <Text style={styles.cardMeta}>
                                            {item.strCategory} · {item.strArea}
                                        </Text>
                                        <View style={styles.cardFooter}>
                                            <Text style={styles.cardTag}>View details</Text>
                                            <TouchableOpacity
                                                onPress={() => toggleFavorite(item.idMeal)}
                                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.favIcon,
                                                        item.isFavorite && styles.favIconActive,
                                                    ]}
                                                >
                                                    {item.isFavorite ? '♥ Saved' : '♡ Save'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </ScrollView>
                </View>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },

    topBar: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
    menuButton: {
        width: 45,
        height: 42,
        left: -4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIcon: {
        color: '#e5e7eb',
        fontSize: 18,
    },
    appName: {
        color: '#f97316',
        fontSize: 20,
        fontWeight: '800',
    },
    appTagline: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 2,
    },
    topRight: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },
    logoutButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#4b5563',
    },
    logoutText: {
        color: '#e5e7eb',
        fontSize: 12,
        fontWeight: '500',
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    greeting: { color: '#f9fafb', fontSize: 22, fontWeight: '700', marginTop: 4 },
    subtitle: { color: '#9CA3AF', marginTop: 4, marginBottom: 12 },

    searchRow: { flexDirection: 'row', marginBottom: 10, marginTop: 6 },
    searchInput: {
        flex: 1,
        backgroundColor: '#020617',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1f2937',
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: '#f9fafb',
        marginRight: 8,
        fontSize: 14,
    },
    searchButton: {
        backgroundColor: '#f97316',
        borderRadius: 14,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    searchButtonText: { color: '#111827', fontWeight: '600', fontSize: 14 },

    chipRow: {
        flexDirection: 'row',
        marginBottom: 16,
        columnGap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#020617',
        borderWidth: 1,
        borderColor: '#1f2937',
    },
    chipActive: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    chipText: { color: '#e5e7eb', fontSize: 12 },
    chipTextActive: {
        color: '#111827',
        fontWeight: '600',
    },

    featuredCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        height: 190,
    },
    featuredImage: { width: '100%', height: '100%' },
    featuredOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15,23,42,0.45)',
    },
    featuredContent: {
        position: 'absolute',
        left: 16,
        bottom: 16,
        right: 16,
    },
    featuredLabel: {
        color: '#fed7aa',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    featuredTitle: { color: '#f9fafb', fontSize: 20, fontWeight: '800' },
    featuredMeta: { color: '#e5e7eb', fontSize: 12, marginTop: 4 },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sectionTitle: { color: '#f9fafb', fontSize: 18, fontWeight: '700' },

    emptyState: {
        backgroundColor: '#020617',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2937',
        padding: 16,
        marginTop: 8,
        marginBottom: 16,
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
    cardInfo: { flex: 1, paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' },
    cardTitle: { color: '#f9fafb', fontSize: 15, fontWeight: '600' },
    cardMeta: { color: '#9CA3AF', marginTop: 4, fontSize: 12 },
    cardFooter: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTag: { color: '#f97316', fontSize: 12, fontWeight: '600' },
    favIcon: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '500',
    },
    favIconActive: {
        color: '#fb7185',
        fontWeight: '700',
    },
});
