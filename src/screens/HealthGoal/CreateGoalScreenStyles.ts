import { StyleSheet } from 'react-native';

export const BRAND_COLOR = '#8BC34A';
export const BG_COLOR = '#F8F9FA';

export const styles = StyleSheet.create({
    // Container Styles
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },
    innerContainer: {
        flex: 1,
    },

    // Header Section
    headerSection: {
        marginBottom: 0,
    },
    headerBackground: {
        height: 140,
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

    // Form Card
    formCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: -30,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },
    formSection: {
        marginBottom: 4,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 6,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
    },
    required: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '700',
    },
    optional: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1F2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 20,
    },
    textAreaContainer: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        height: 120,
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        fontSize: 15,
        color: '#1F2937',
        height: '100%',
        textAlignVertical: 'top',
    },
    charCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },

    // Target Section Header
    targetSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginHorizontal: 16,
    },
    targetHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    targetSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    addTargetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BRAND_COLOR,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    addTargetText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    // Empty State
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        marginBottom: 16,
        marginHorizontal: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },

    // Target Card
    targetCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    targetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    targetTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    targetIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${BRAND_COLOR}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    targetUnit: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    removeButton: {
        padding: 4,
    },

    // Target Type Selector
    targetTypeContainer: {
        marginBottom: 4,
    },
    targetTypeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    targetTypeTabs: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 4,
        marginTop: 8,
    },
    targetTypeTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTargetTypeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    targetTypeTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTargetTypeTabText: {
        color: BRAND_COLOR,
    },

    // Value Inputs
    valueSection: {
        marginBottom: 4,
    },
    valueSectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    valueInputContainer: {
        flex: 1,
    },
    valueInputWrapper: {
        // Wrapper để chứa input, giúp căn chỉnh tốt hơn
    },
    arrowContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingTop: 5, // Căn chỉnh với phần giữa của input
    },
    valueLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    valueInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '600',
        textAlign: 'center',
    },
    unitLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '600',
    },

    // Weight Input
    weightContainer: {
        marginTop: 4,
    },
    weightLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    weightInputRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    weightButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        minHeight: 48,
        justifyContent: 'center',
    },
    activeWeightButton: {
        backgroundColor: `${BRAND_COLOR}15`,
        borderColor: BRAND_COLOR,
    },
    weightButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6B7280',
    },
    activeWeightButtonText: {
        color: BRAND_COLOR,
    },
    weightLabelText: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F0F9FF',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        gap: 12,
        marginBottom: 20,
    },
    infoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
    },

    // Save Button
    saveButton: {
        flexDirection: 'row',
        backgroundColor: BRAND_COLOR,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: BRAND_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },

    // Search Bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
    },

    // Loading State
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 12,
        fontWeight: '500',
    },

    // Empty Modal State
    emptyModalState: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyModalText: {
        fontSize: 15,
        color: '#9CA3AF',
        marginTop: 12,
        fontWeight: '500',
    },

    // Nutrient Item
    nutrientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    nutrientItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    nutrientIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${BRAND_COLOR}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nutrientItemText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
    },
    nutrientItemUnit: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
});