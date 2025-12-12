import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BRAND_COLOR = '#8BC34A';
const BG_COLOR = '#F8F9FA';

export const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BG_COLOR,
    },
    retryButton: {
        backgroundColor: BRAND_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    
    // --- Header Section (Redesigned) ---
    headerSection: {
        marginBottom: 16,
    },
    headerBackground: {
        height: 160,
        backgroundColor: BRAND_COLOR,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -50,
        right: -40,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -20,
        left: -20,
    },
    headerContent: {
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        fontWeight: '500',
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // --- Profile Card (Replaces old header) ---
    profileCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: -40,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },
    
    avatarSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFF',
    },
    avatarPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: BRAND_COLOR,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    profileBio: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    
    // --- Stats Card ---
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 30,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    
    // --- Action Buttons ---
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: BRAND_COLOR,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    shareButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1.5,
        borderColor: BRAND_COLOR,
    },
    shareButtonText: {
        color: BRAND_COLOR,
        fontWeight: '700',
        fontSize: 14,
    },
    logoutButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FEE2E2',
    },
    reportButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFFBEB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FEF3C7',
    },
    
    // --- Content Section ---
    contentSection: {
        paddingHorizontal: 16,
    },
    
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
        maxWidth: '60%',
        textAlign: 'right',
    },
    
    // --- Recipe Section ---
    recipeSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    
    recipeSectionHeader: {
        marginBottom: 16,
    },
    recipeTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    recipeSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    recipeBadge: {
        backgroundColor: BRAND_COLOR,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 32,
        alignItems: 'center',
    },
    recipeBadgeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    
    // --- Tab Container ---
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabButton: {
        backgroundColor: BRAND_COLOR,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    inactiveTabText: {
        color: '#6B7280',
    },
    
    // --- Search Bar ---
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 48,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#1F2937',
        fontSize: 14,
        fontWeight: '500',
    },
    
    recipesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    
    emptyState: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 12,
    },
});

export const BRAND_COLOR_EXPORT = BRAND_COLOR;