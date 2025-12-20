import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import styles from './CreateRecipeScreenStyles';
import HeaderApp from '../../components/HeaderApp';
import LabelSelector from '../../components/LabelSelector';
import IngredientSelector from '../../components/IngredientSelector';
import {
  updateRecipe,
  getRecipeById,
  CreateRecipePayload,
  RecipeDetail,
} from '../../services/RecipeService';
import { Label } from '../../services/LabelService';

const MAX_IMAGES_PER_STEP = 5;

interface CookingStep {
  id: number;
  description: string;
  images: StepImage[];
}

interface StepImage {
  uri: string;
  existingImageId?: string; // ID của ảnh đã có trên server
  imageOrder: number;
}

interface IngredientWithQuantity {
  ingredientId: string;
  ingredientName: string;
  quantityGram: number;
}

type EditRecipeScreenRouteProp = RouteProp<
  { EditRecipe: { recipeId: string } },
  'EditRecipe'
>;

const CookingStepComponent: React.FC<{
  step: CookingStep;
  index: number;
  onRemove: (id: number) => void;
  onDescriptionChange: (id: number, text: string) => void;
  onAddImage: (id: number) => void;
  onRemoveImage: (stepId: number, imageIndex: number) => void;
  focusedInput: string | null;
  onFocus: (field: string) => void;
  onBlur: () => void;
}> = ({ step, index, onRemove, onDescriptionChange, onAddImage, onRemoveImage, focusedInput, onFocus, onBlur }) => {
  const remainingSlots = MAX_IMAGES_PER_STEP - step.images.length;
  const isLimitReached = remainingSlots === 0;
  const isFocused = focusedInput === `step-${step.id}`;

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepTitleContainer}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepTitle}>Bước {index + 1}</Text>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(step.id)}>
          <Icon name="close-circle" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.stepInput, isFocused && styles.stepInputFocused]}
        placeholder="Mô tả chi tiết bước làm..."
        placeholderTextColor="#9CA3AF"
        multiline
        value={step.description}
        onChangeText={(text) => onDescriptionChange(step.id, text)}
        onFocus={() => onFocus(`step-${step.id}`)}
        onBlur={onBlur}
      />

      {step.images.length > 0 && (
        <ScrollView horizontal style={styles.imageGallery} showsHorizontalScrollIndicator={false}>
          {step.images.map((img, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.stepImage} />
              <TouchableOpacity
                onPress={() => onRemoveImage(step.id, idx)}
                style={styles.removeImageButton}
              >
                <Icon name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.addImageControls}>
        <TouchableOpacity
          style={[styles.addImageButton, isLimitReached && styles.addImageButtonDisabled]}
          onPress={() => onAddImage(step.id)}
          disabled={isLimitReached}
        >
          <Icon name="image-plus" size={18} color={isLimitReached ? '#D1D5DB' : '#8BC34A'} />
          <Text style={[styles.addImageText, isLimitReached && styles.addImageTextDisabled]}>
            Thêm ảnh ({step.images.length}/{MAX_IMAGES_PER_STEP})
          </Text>
        </TouchableOpacity>
        {isLimitReached && (
          <Text style={styles.imageLimitText}>Đã đạt giới hạn</Text>
        )}
      </View>
    </View>
  );
};

const mapDifficultyToVietnamese = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    'EASY': 'Dễ',
    'MEDIUM': 'Vừa',
    'HARD': 'Khó',
  };
  return difficultyMap[difficulty] || 'Dễ';
};

const mapDifficultyToEnglish = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    'Dễ': 'EASY',
    'Vừa': 'MEDIUM',
    'Khó': 'HARD',
  };
  return difficultyMap[difficulty] || 'EASY';
};

const EditRecipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditRecipeScreenRouteProp>();
  const { recipeId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [recipeName, setRecipeName] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [ration, setRation] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Dễ');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageChanged, setCoverImageChanged] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientWithQuantity[]>([]);
  const [steps, setSteps] = useState<CookingStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const difficultyOptions = ['Dễ', 'Vừa', 'Khó'];

  const handleFocus = (field: string) => setFocusedInput(field);
  const handleBlur = () => setFocusedInput(null);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Load recipe data
  useEffect(() => {
    loadRecipeData();
  }, [recipeId]);

  const loadRecipeData = async () => {
    try {
      setIsLoading(true);
      const recipe: RecipeDetail = await getRecipeById(recipeId);

      setRecipeName(recipe.name || '');
      setCookTime(recipe.cookTime?.toString() || '');
      setRation(recipe.ration?.toString() || '');
      setDescription(recipe.description || '');
      setDifficulty(mapDifficultyToVietnamese(recipe.difficulty?.value || 'EASY'));
      setCoverImage(recipe.imageUrl || null);
      setCoverImageChanged(false);

      // Load labels
      if (recipe.labels) {
        setSelectedLabels(recipe.labels.map(label => ({
          id: label.id,
          name: label.name,
          colorCode: label.colorCode,
        })));
      }

      // Load ingredients
      if (recipe.ingredients) {
        setSelectedIngredients(recipe.ingredients.map(ing => ({
          ingredientId: ing.ingredientId || ing.id || '',
          ingredientName: ing.name,
          quantityGram: ing.quantityGram,
        })));
      }

      // Load cooking steps
      if (recipe.cookingSteps && recipe.cookingSteps.length > 0) {
        const loadedSteps: CookingStep[] = recipe.cookingSteps
          .sort((a, b) => a.stepOrder - b.stepOrder)
          .map((step, index) => ({
            id: index + 1,
            description: step.instruction || '',
            images: (step.cookingStepImages || [])
              .sort((a, b) => a.imageOrder - b.imageOrder)
              .map(img => ({
                uri: img.imageUrl || '',
                existingImageId: img.imageId,
                imageOrder: img.imageOrder,
              })),
          }));
        setSteps(loadedSteps);
      } else {
        setSteps([
          { id: 1, description: '', images: [] },
          { id: 2, description: '', images: [] },
        ]);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin công thức. Vui lòng thử lại.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const checkImageSize = async (uri: string): Promise<boolean> => {
    try {
      const response = await fetch(uri);
      if (!response.ok) return true;
      const blob = await response.blob();
      const sizeInMB = blob.size / (1024 * 1024);

      if (sizeInMB > 10) {
        Alert.alert('Ảnh quá lớn', 'Vui lòng chọn ảnh nhỏ hơn 10MB');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking file size:', error);
      return true;
    }
  };

  const launchLibrary = async (selectionLimit: number): Promise<string[] | null> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Quyền bị từ chối',
          'Ứng dụng cần quyền truy cập thư viện ảnh.',
          [
            { text: 'Để sau' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: selectionLimit > 1,
        selectionLimit: selectionLimit,
      });

      if (!result.canceled && result.assets) {
        return result.assets.map(asset => asset.uri);
      }
      return null;
    } catch (error) {
      console.error('Error launching library:', error);
      return null;
    }
  };

  const launchCamera = async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Quyền bị từ chối',
          'Ứng dụng cần quyền truy cập Camera.',
          [
            { text: 'Để sau' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error launching camera:', error);
      return null;
    }
  };

  const handlePickCoverImage = async () => {
    Alert.alert(
      'Tải ảnh lên',
      'Bạn muốn tải ảnh lên từ đâu?',
      [
        {
          text: 'Chụp ảnh mới',
          onPress: async () => {
            const uri = await launchCamera();
            if (uri) {
              const isValid = await checkImageSize(uri);
              if (isValid) {
                setCoverImage(uri);
                setCoverImageChanged(true);
              }
            }
          },
        },
        {
          text: 'Chọn từ Thư viện ảnh',
          onPress: async () => {
            const uris = await launchLibrary(1);
            if (uris && uris.length > 0) {
              const uri = uris[0];
              const isValid = await checkImageSize(uri);
              if (isValid) {
                setCoverImage(uri);
                setCoverImageChanged(true);
              }
            }
          },
        },
        { text: 'Hủy bỏ', style: 'cancel' },
      ],
    );
  };

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImageChanged(true);
  };

  const handleAddStep = () => {
    const newId = steps.length > 0 ? steps[steps.length - 1].id + 1 : 1;
    setSteps([...steps, { id: newId, description: '', images: [] }]);
  };

  const handleRemoveStep = (id: number) => {
    if (steps.length <= 1) {
      Alert.alert('Thông báo', 'Phải có ít nhất 1 bước làm');
      return;
    }
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleStepDescriptionChange = (id: number, text: string) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, description: text } : step)));
  };

  const handleAddImageToStep = (id: number) => {
    const currentStep = steps.find(step => step.id === id);
    if (!currentStep) return;

    const remainingSlots = MAX_IMAGES_PER_STEP - currentStep.images.length;
    if (remainingSlots <= 0) {
      Alert.alert('Giới hạn ảnh', `Mỗi bước chỉ được phép tối đa ${MAX_IMAGES_PER_STEP} ảnh.`);
      return;
    }

    Alert.alert(
      'Thêm ảnh cho Bước',
      `Bạn còn ${remainingSlots} ảnh có thể thêm. Bạn muốn tải ảnh lên từ đâu?`,
      [
        {
          text: 'Chụp ảnh mới',
          onPress: async () => {
            const uri = await launchCamera();
            if (uri) {
              const isValid = await checkImageSize(uri);
              if (isValid) {
                setSteps((prev) =>
                  prev.map((step) =>
                    step.id === id
                      ? {
                          ...step,
                          images: [
                            ...step.images,
                            { uri, imageOrder: step.images.length + 1 },
                          ],
                        }
                      : step
                  )
                );
              }
            }
          },
        },
        {
          text: 'Chọn từ Thư viện ảnh (Đa chọn)',
          onPress: async () => {
            const uris = await launchLibrary(remainingSlots);
            if (uris && uris.length > 0) {
              const validUris: string[] = [];
              for (const uri of uris) {
                const isValid = await checkImageSize(uri);
                if (isValid) validUris.push(uri);
                if (validUris.length >= remainingSlots) break;
              }

              if (validUris.length > 0) {
                setSteps((prev) =>
                  prev.map((step) =>
                    step.id === id
                      ? {
                          ...step,
                          images: [
                            ...step.images,
                            ...validUris.map((uri, idx) => ({
                              uri,
                              imageOrder: step.images.length + idx + 1,
                            })),
                          ],
                        }
                      : step
                  )
                );
              }
            }
          },
        },
        { text: 'Hủy bỏ', style: 'cancel' },
      ],
    );
  };

  const handleRemoveImageFromStep = (stepId: number, imageIndex: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              images: step.images.filter((_, idx) => idx !== imageIndex),
            }
          : step
      )
    );
  };

  const handleUpdateRecipe = async () => {
    if (isSubmitting) return;

    if (!recipeName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món ăn');
      return;
    }
    if (!cookTime || parseInt(cookTime) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập thời gian nấu hợp lệ');
      return;
    }
    if (!ration || parseInt(ration) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập khẩu phần hợp lệ');
      return;
    }
    if (selectedIngredients.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 nguyên liệu');
      return;
    }

    const validSteps = steps.filter(s => s.description.trim() !== '');
    if (validSteps.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 bước làm');
      return;
    }

    setIsSubmitting(true);

    try {
      const cookingSteps = validSteps.map((step, index) => ({
        instruction: step.description.trim(),
        stepOrder: index + 1,
        images: step.images.map((img, imgIndex) => ({
          ...(img.existingImageId ? { id: img.existingImageId } : { image: img.uri }),
          imageOrder: imgIndex + 1,
        })),
      }));

      const payload: Partial<CreateRecipePayload> = {
        name: recipeName.trim(),
        description: description.trim() || undefined,
        difficulty: mapDifficultyToEnglish(difficulty),
        cookTime: parseInt(cookTime, 10),
        ration: parseInt(ration, 10),
        ...(coverImageChanged ? { image: coverImage || undefined } : {}),
        labelIds: selectedLabels.map(label => label.id),
        ingredients: selectedIngredients.map(item => ({
          ingredientId: item.ingredientId,
          quantityGram: item.quantityGram,
        })),
        cookingSteps: cookingSteps,
      };

      await updateRecipe(recipeId, payload);

      Alert.alert('Thành công 🎉', 'Đã cập nhật công thức!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error('Error updating recipe:', error);
      let errorMessage = 'Đã xảy ra lỗi không xác định';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Lỗi cập nhật công thức', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#8BC34A" />
        <HeaderApp isHome={false} onBackPress={handleBackPress} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8BC34A" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>
            Đang tải công thức...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#8BC34A" />
      <HeaderApp isHome={false} onBackPress={handleBackPress} />

      <View style={styles.innerContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerBackground}>
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.headerTitle}>Chỉnh Sửa Công Thức</Text>
                  <Text style={styles.headerSubtitle}>Cập nhật công thức nấu ăn của bạn</Text>
                </View>
                <View style={styles.headerIconContainer}>
                  <Icon name="pencil" size={28} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
            </View>
          </View>

          {/* Cover Image Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="image" size={18} color="#8BC34A" />
              <Text style={styles.sectionTitle}>Hình ảnh món ăn</Text>
            </View>
            <Text style={styles.sectionHint}>Tải ảnh bìa đẹp để thu hút người xem hơn</Text>

            <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickCoverImage}>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
              ) : (
                <>
                  <Icon name="camera-plus" size={48} color="#D1D5DB" />
                  <Text style={styles.imagePlaceholderText}>Nhấn để chọn ảnh</Text>
                </>
              )}
            </TouchableOpacity>

            {coverImage && (
              <TouchableOpacity onPress={handleRemoveCoverImage} style={styles.removeCoverButton}>
                <Icon name="close" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Basic Info Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="information" size={18} color="#8BC34A" />
              <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên món ăn <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, focusedInput === 'recipeName' && styles.inputFocused]}
                placeholder="VD: Phở Bò Hà Nội"
                placeholderTextColor="#9CA3AF"
                value={recipeName}
                onChangeText={setRecipeName}
                onFocus={() => handleFocus('recipeName')}
                onBlur={handleBlur}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Thời gian (phút) <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, focusedInput === 'cookTime' && styles.inputFocused]}
                  placeholder="30"
                  placeholderTextColor="#9CA3AF"
                  value={cookTime}
                  onChangeText={setCookTime}
                  keyboardType="numeric"
                  onFocus={() => handleFocus('cookTime')}
                  onBlur={handleBlur}
                />
              </View>

              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Khẩu phần (người) <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, focusedInput === 'ration' && styles.inputFocused]}
                  placeholder="2"
                  placeholderTextColor="#9CA3AF"
                  value={ration}
                  onChangeText={setRation}
                  keyboardType="numeric"
                  onFocus={() => handleFocus('ration')}
                  onBlur={handleBlur}
                />
              </View>
            </View>

            {/* Difficulty Tabs */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Độ khó</Text>
              <View style={styles.difficultyTabContainer}>
                {difficultyOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.difficultyTab,
                      difficulty === option && styles.difficultyTabActive
                    ]}
                    onPress={() => setDifficulty(option)}
                  >
                    <Icon 
                      name={
                        option === 'Dễ' ? 'emoticon-happy-outline' : 
                        option === 'Vừa' ? 'emoticon-neutral-outline' : 
                        'emoticon-sad-outline'
                      } 
                      size={20} 
                      color={difficulty === option ? '#FFFFFF' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.difficultyTabText,
                      difficulty === option && styles.difficultyTabTextActive
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả món ăn</Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  focusedInput === 'description' && styles.textAreaFocused
                ]}
                placeholder="Mô tả chi tiết về món ăn của bạn..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={description}
                onChangeText={setDescription}
                onFocus={() => handleFocus('description')}
                onBlur={handleBlur}
              />
            </View>
          </View>

          {/* Ingredients Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="food-apple" size={18} color="#8BC34A" />
              <Text style={styles.sectionTitle}>Nguyên liệu</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <IngredientSelector
              selectedIngredients={selectedIngredients}
              onIngredientsChange={setSelectedIngredients}
            />
          </View>

          {/* Labels Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="tag-multiple" size={18} color="#8BC34A" />
              <Text style={styles.sectionTitle}>Nhãn</Text>
            </View>
            <LabelSelector
              selectedLabels={selectedLabels}
              onLabelsChange={setSelectedLabels}
            />
          </View>

          {/* Cooking Steps Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="format-list-numbered" size={18} color="#8BC34A" />
              <Text style={styles.sectionTitle}>Hướng dẫn nấu</Text>
              <Text style={styles.required}>*</Text>
            </View>

            {steps.map((step, index) => (
              <CookingStepComponent
                key={step.id}
                step={step}
                index={index}
                onRemove={handleRemoveStep}
                onDescriptionChange={handleStepDescriptionChange}
                onAddImage={handleAddImageToStep}
                onRemoveImage={handleRemoveImageFromStep}
                focusedInput={focusedInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            ))}

            <TouchableOpacity style={styles.addStepButton} onPress={handleAddStep}>
              <Icon name="plus-circle" size={20} color="#8BC34A" />
              <Text style={styles.addStepButtonText}>Thêm bước làm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="lightbulb-on" size={20} color="#F59E0B" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Mẹo hay</Text>
              <Text style={styles.infoText}>
                Thêm ảnh cho từng bước để người đọc dễ hình dung và làm theo hơn.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBackPress}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
              onPress={handleUpdateRecipe}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Đang cập nhật...</Text>
                </>
              ) : (
                <>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Cập nhật</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EditRecipeScreen;