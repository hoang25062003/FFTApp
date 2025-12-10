// src/components/Pagination.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
    showPageSizeSelector = true,
}) => {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const handleFirst = () => {
        if (currentPage !== 1) onPageChange(1);
    };

    const handleLast = () => {
        if (currentPage !== totalPages) onPageChange(totalPages);
    };

    const renderPageNumbers = () => {
        const pages: number[] = [];
        const maxVisible = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages.map((page) => (
            <TouchableOpacity
                key={page}
                style={[
                    styles.pageButton,
                    currentPage === page && styles.pageButtonActive,
                ]}
                onPress={() => onPageChange(page)}
                disabled={currentPage === page}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.pageButtonText,
                        currentPage === page && styles.pageButtonTextActive,
                    ]}
                >
                    {page}
                </Text>
            </TouchableOpacity>
        ));
    };

    return (
        <View style={styles.container}>
            {/* Page Size Selector */}
            {showPageSizeSelector && onPageSizeChange && (
                <View style={styles.pageSizeContainer}>
                    <Text style={styles.pageSizeLabel}>Hiển thị</Text>
                    <View style={styles.pageSizeButtonsWrapper}>
                        {pageSizeOptions.map((size) => (
                            <TouchableOpacity
                                key={size}
                                style={[
                                    styles.pageSizeButton,
                                    pageSize === size && styles.pageSizeButtonActive,
                                ]}
                                onPress={() => onPageSizeChange(size)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.pageSizeButtonText,
                                        pageSize === size && styles.pageSizeButtonTextActive,
                                    ]}
                                >
                                    {size}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.pageSizeLabel}>mỗi trang</Text>
                </View>
            )}

            {/* Pagination Info */}


            {/* Pagination Controls */}
            <View style={styles.controlsContainer}>
                {/* First Page Button */}
                <TouchableOpacity
                    style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
                    onPress={handleFirst}
                    disabled={currentPage === 1}
                    activeOpacity={0.7}
                >
                    <Icon
                        name="page-first"
                        size={18}
                        color={currentPage === 1 ? '#D1D5DB' : '#8BC34A'}
                    />
                </TouchableOpacity>

                {/* Previous Button */}
                <TouchableOpacity
                    style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
                    onPress={handlePrevious}
                    disabled={currentPage === 1}
                    activeOpacity={0.7}
                >
                    <Icon
                        name="chevron-left"
                        size={22}
                        color={currentPage === 1 ? '#D1D5DB' : '#8BC34A'}
                    />
                </TouchableOpacity>

                {/* Page Numbers */}
                <View style={styles.pageNumbersContainer}>
                    {renderPageNumbers()}
                </View>

                {/* Next Button */}
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        currentPage === totalPages && styles.navButtonDisabled,
                    ]}
                    onPress={handleNext}
                    disabled={currentPage === totalPages}
                    activeOpacity={0.7}
                >
                    <Icon
                        name="chevron-right"
                        size={22}
                        color={currentPage === totalPages ? '#D1D5DB' : '#8BC34A'}
                    />
                </TouchableOpacity>

                {/* Last Page Button */}
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        currentPage === totalPages && styles.navButtonDisabled,
                    ]}
                    onPress={handleLast}
                    disabled={currentPage === totalPages}
                    activeOpacity={0.7}
                >
                    <Icon
                        name="page-last"
                        size={18}
                        color={currentPage === totalPages ? '#D1D5DB' : '#8BC34A'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    
    // Page Size Selector
    pageSizeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    pageSizeLabel: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
        marginHorizontal: 8,
    },
    pageSizeButtonsWrapper: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 3,
    },
    pageSizeButton: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        marginHorizontal: 2,
        borderRadius: 8,
        minWidth: 40,
        alignItems: 'center',
    },
    pageSizeButtonActive: {
        backgroundColor: '#8BC34A',
        shadowColor: '#8BC34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    pageSizeButtonText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },
    pageSizeButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    
    // Info
    infoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    infoBadge: {
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    infoText: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '700',
    },
    infoTextLight: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    
    // Controls
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    navButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonDisabled: {
        backgroundColor: '#F9FAFB',
    },
    
    // Page Numbers
    pageNumbersContainer: {
        flexDirection: 'row',
        marginHorizontal: 4,
        gap: 4,
    },
    pageButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        minWidth: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageButtonActive: {
        backgroundColor: '#8BC34A',
        borderColor: '#8BC34A',
        shadowColor: '#8BC34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    pageButtonText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },
    pageButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

export default Pagination;