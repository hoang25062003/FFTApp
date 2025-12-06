import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import styles from './CreateRecipeScreenStyles'; // Import styles
import CustomInput from '../../components/CustomInput';
import LabelSelector from '../../components/LabelSelector';
import IngredientSelector from '../../components/IngredientSelector';
import {
  createRecipe,
  CreateRecipePayload,
} from '../../services/RecipeService';
import { Label } from '../../services/LabelService';
import { Ingredient } from '../../services/IngredientService';

const MAX_IMAGES_PER_STEP = 5; // Giới hạn ảnh tối đa cho mỗi bước

const InputSection: React.FC<{ title: string; hint: string; children?: React.ReactNode }> = ({
  title,
  hint,
  children,
}) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionHint}>{hint}</Text>
    {children}
  </View>
);

interface CookingStep {
  id: number;
  description: string;
  images: string[];
}

interface IngredientWithQuantity {
  ingredientId: string;
  ingredientName: string;
  quantityGram: number;
}

const CookingStepComponent: React.FC<{
  step: CookingStep;
  index: number;
  onRemove: (id: number) => void;
  onDescriptionChange: (id: number, text: string) => void;
  onAddImage: (id: number) => void;
  onRemoveImage: (stepId: number, uri: string) => void;
}> = ({ step, index, onRemove, onDescriptionChange, onAddImage, onRemoveImage }) => {
  const [stepDescFocused, setStepDescFocused] = useState(false);
  const remainingSlots = MAX_IMAGES_PER_STEP - step.images.length;
  const isLimitReached = remainingSlots === 0;

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Bước {index + 1}</Text>
        <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(step.id)}>
          <Text style={styles.removeButtonText}>Xóa bước</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.inputField,
          { height: 80, textAlignVertical: 'top' },
          stepDescFocused && styles.inputFocused,
        ]}
        placeholder="Mô tả chi tiết bước làm..."
        multiline
        value={step.description}
        onChangeText={(text) => onDescriptionChange(step.id, text)}
        onFocus={() => setStepDescFocused(true)}
        onBlur={() => setStepDescFocused(false)}
      />

      {step.images.length > 0 && (
        <ScrollView horizontal style={styles.imageGallery} showsHorizontalScrollIndicator={false}>
          {step.images.map((img, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image
                source={{ uri: img }}
                style={styles.stepImage}
              />
              <TouchableOpacity
                onPress={() => onRemoveImage(step.id, img)}
                style={styles.removeImageOverlay}
              >
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* NEW: Updated Add Image Button */}
      <View style={styles.addImageControls}>
        <TouchableOpacity
          style={[
            styles.addStepImageButton,
            isLimitReached && styles.addStepImageButtonDisabled,
          ]}
          onPress={() => onAddImage(step.id)}
          disabled={isLimitReached}
        >
          <Icon name="add-circle-outline" size={20} color={isLimitReached ? '#ccc' : '#222'} />
          <Text style={[styles.addStepImageText, { color: isLimitReached ? '#ccc' : '#222' }]}>
            Thêm ảnh ({step.images.length}/{MAX_IMAGES_PER_STEP})
          </Text>
        </TouchableOpacity>
        {isLimitReached && (
          <Text style={styles.imageLimitText}>Đã đạt giới hạn ({MAX_IMAGES_PER_STEP})</Text>
        )}
      </View>
    </View>
  );
};

// Map difficulty từ tiếng Việt sang English
const mapDifficultyToEnglish = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    'Dễ': 'EASY',
    'Vừa': 'MEDIUM',
    'Khó': 'HARD',
  };
  return difficultyMap[difficulty] || 'EASY';
};

const AddScreen: React.FC = () => {
  const navigation = useNavigation();

  const [recipeName, setRecipeName] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [ration, setRation] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Dễ');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientWithQuantity[]>([]);
  const [steps, setSteps] = useState<CookingStep[]>([
    { id: 1, description: '', images: [] },
    { id: 2, description: '', images: [] },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: Focus States
  const [nameFocused, setNameFocused] = useState(false);
  const [cookTimeFocused, setCookTimeFocused] = useState(false);
  const [rationFocused, setRationFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const difficultyOptions = ['Dễ', 'Vừa', 'Khó'];

  const checkImageSize = async (uri: string): Promise<boolean> => {
    try {
      const response = await fetch(uri);

      if (!response.ok) return true;

      const blob = await response.blob();
      const sizeInMB = blob.size / (1024 * 1024);

      console.log('Image size:', sizeInMB.toFixed(2), 'MB');

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

  // ✅ UPDATED: Launch library to support multi-selection and respect limit
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
        allowsMultipleSelection: selectionLimit > 1, // Enable multi-selection if limit > 1
        selectionLimit: selectionLimit, // Set limit based on remaining slots
      });

      if (!result.canceled && result.assets) {
        return result.assets.map(asset => asset.uri); // Return array of URIs
      }

      return null;
    } catch (error) {
      console.error('Error launching library:', error);
      return null;
    }
  };

  // Kept launchCamera simple, returning single URI
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
              if (isValid) setCoverImage(uri);
            }
          },
        },
        {
          text: 'Chọn từ Thư viện ảnh',
          onPress: async () => {
            // Only allow picking 1 cover image
            const uris = await launchLibrary(1);
            if (uris && uris.length > 0) {
              const uri = uris[0];
              const isValid = await checkImageSize(uri);
              if (isValid) setCoverImage(uri);
            }
          },
        },
        {
          text: 'Hủy bỏ',
          style: 'cancel',
        },
      ],
    );
  };

  const handleRemoveCoverImage = () => setCoverImage(null);

  const handleAddStep = () => {
    const newId = steps.length > 0 ? steps[steps.length - 1].id + 1 : 1;
    setSteps([...steps, { id: newId, description: '', images: [] }]);
  };

  const handleRemoveStep = (id: number) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleStepDescriptionChange = (id: number, text: string) => {
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, description: text } : step))
    );
  };

  // ✅ UPDATED: Handle image selection logic for steps
  const handleAddImageToStep = (id: number) => {
    const currentStep = steps.find(step => step.id === id);
    if (!currentStep) return;

    const currentCount = currentStep.images.length;
    const remainingSlots = MAX_IMAGES_PER_STEP - currentCount;

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
                    step.id === id ? { ...step, images: [...step.images, uri] } : step
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
              // Check size for all selected URIs and filter
              const validUris: string[] = [];
              for (const uri of uris) {
                const isValid = await checkImageSize(uri);
                if (isValid) {
                  validUris.push(uri);
                }
                // Stop adding if validUris hits the remaining slot limit (should be handled by ImagePicker, but just in case)
                if (validUris.length >= remainingSlots) break;
              }

              if (validUris.length > 0) {
                setSteps((prev) =>
                  prev.map((step) =>
                    step.id === id
                      ? { ...step, images: [...step.images, ...validUris] }
                      : step
                  )
                );
              }
            }
          },
        },
        {
          text: 'Hủy bỏ',
          style: 'cancel',
        },
      ],
    );
  };

  const handleRemoveImageFromStep = (stepId: number, uri: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? { ...step, images: step.images.filter((img) => img !== uri) }
          : step
      )
    );
  };

  const handlePostRecipe = async () => {
    if (isSubmitting) return;

    // ✅ Validation
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
      // ✅ Prepare cooking steps
      const cookingSteps = validSteps.map((step, index) => ({
        instruction: step.description.trim(),
        stepOrder: index + 1,
        images: step.images.map((uri, imgIndex) => ({
          image: uri,
          imageOrder: imgIndex + 1,
        })),
      }));

      // ✅ Prepare payload with proper types
      const payload: CreateRecipePayload = {
        name: recipeName.trim(),
        description: description.trim() || undefined,
        difficulty: mapDifficultyToEnglish(difficulty),
        cookTime: parseInt(cookTime, 10),
        ration: parseInt(ration, 10),
        image: coverImage || undefined,
        labelIds: selectedLabels.map(label => label.id),
        ingredients: selectedIngredients.map(item => ({
          ingredientId: item.ingredientId,
          quantityGram: item.quantityGram,
        })),
        cookingSteps: cookingSteps,
      };

      console.log('=== Payload Preview ===');
      console.log('Recipe Name:', payload.name);
      console.log('Difficulty:', payload.difficulty);
      console.log('Cook Time:', payload.cookTime, 'minutes');
      console.log('Ration:', payload.ration, 'servings');
      console.log('Cover Image:', payload.image ? 'Yes' : 'No');
      console.log('Labels:', payload.labelIds?.length || 0);
      console.log('Ingredients:', payload.ingredients?.length || 0);
      console.log('Steps:', payload.cookingSteps?.length || 0);

      // ✅ Log each step's images
      payload.cookingSteps?.forEach((step, idx) => {
        console.log(`Step ${idx + 1}:`, step.instruction.substring(0, 30) + '...');
        console.log(`  - Images:`, step.images.length);
      });

      const newRecipe = await createRecipe(payload);

      Alert.alert('Thành công 🎉', `Đã tạo công thức "${newRecipe.name}"!`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        }
      ]);

    } catch (error) {
      console.error('=== Error Creating Recipe ===');
      console.error(error);

      let errorMessage = 'Đã xảy ra lỗi không xác định';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Lỗi đăng công thức', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Tạo công thức món ăn</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <InputSection
          title="Hình ảnh món ăn"
          hint="Tải ảnh bìa của bạn lên, ảnh chấp nhận định dạng PNG hoặc JPG."
        >
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={[styles.imagePlaceholder, { height: 250, overflow: 'hidden' }]}
              onPress={handlePickCoverImage}
            >
              {coverImage ? (
                <Image
                  source={{ uri: coverImage }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                />
              ) : (
                <>
                  <Icon
                    name="camera-outline"
                    size={40}
                    color="#ccc"
                    style={{ marginBottom: 5 }}
                  />
                  <Text style={styles.chooseImageText}>Chọn hình ảnh</Text>
                </>
              )}
            </TouchableOpacity>

            {coverImage && (
              <TouchableOpacity
                onPress={handleRemoveCoverImage}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon name="close" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </InputSection>

        <InputSection title="Thông tin món ăn" hint="">
          <View style={styles.labeledInputContainer}>
            <Text style={styles.inputLabel}>Tên món ăn</Text>
            <TextInput
              style={[
                styles.inputField,
                styles.inputWithoutMargin,
                nameFocused && styles.inputFocused,
              ]}
              placeholder="Nhập tên món ăn..."
              value={recipeName}
              onChangeText={setRecipeName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>

          <View style={styles.labeledInputContainer}>
            <Text style={styles.inputLabel}>Thời gian nấu (phút)</Text>
            <TextInput
              style={[
                styles.inputField,
                styles.inputWithoutMargin,
                cookTimeFocused && styles.inputFocused,
              ]}
              placeholder="VD: 30"
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="numeric"
              onFocus={() => setCookTimeFocused(true)}
              onBlur={() => setCookTimeFocused(false)}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.difficultyContainer}>
              <Text style={styles.inputLabel}>Độ khó</Text>
              <CustomInput
                placeholder="Chọn độ khó"
                value={difficulty}
                isDropdown={true}
                dropdownOptions={difficultyOptions}
                onSelectOption={setDifficulty}
                style={styles.customInputNoBorder}
              />
            </View>

            <View style={styles.servingContainer}>
              <Text style={styles.inputLabel}>Khẩu phần (người)</Text>
              <TextInput
                style={[
                  styles.halfInputField,
                  styles.inputWithoutMargin,
                  rationFocused && styles.inputFocused,
                ]}
                placeholder="VD: 2"
                value={ration}
                onChangeText={setRation}
                keyboardType="numeric"
                onFocus={() => setRationFocused(true)}
                onBlur={() => setRationFocused(false)}
              />
            </View>
          </View>

          <View style={styles.labeledInputContainer}>
            <Text style={styles.inputLabel}>Mô tả món ăn</Text>
            <TextInput
              style={[
                styles.inputField,
                styles.multilineInput,
                descriptionFocused && styles.inputFocused,
              ]}
              placeholder="Nhập mô tả chi tiết về món ăn..."
              multiline
              value={description}
              onChangeText={setDescription}
              onFocus={() => setDescriptionFocused(true)}
              onBlur={() => setDescriptionFocused(false)}
            />
          </View>
        </InputSection>

        <InputSection title="Nguyên liệu" hint="">
          {/* IngredientSelector is assumed to be an external component */}
          <IngredientSelector
            selectedIngredients={selectedIngredients}
            onIngredientsChange={setSelectedIngredients}
          />
        </InputSection>

        <InputSection title="Nhãn" hint="">
          {/* LabelSelector is assumed to be an external component */}
          <LabelSelector
            selectedLabels={selectedLabels}
            onLabelsChange={setSelectedLabels}
          />
        </InputSection>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hướng dẫn nấu</Text>

          {steps.map((step, index) => (
            <CookingStepComponent
              key={step.id}
              step={step}
              index={index}
              onRemove={handleRemoveStep}
              onDescriptionChange={handleStepDescriptionChange}
              onAddImage={handleAddImageToStep}
              onRemoveImage={handleRemoveImageFromStep}
            />
          ))}

          <TouchableOpacity style={styles.addStepButton} onPress={handleAddStep}>
            <Icon name="add" size={20} color="#fff" />
            <Text style={styles.addStepButtonText}>Thêm bước làm</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handlePostRecipe}
          disabled={isSubmitting}
        >
          <Text style={styles.postButtonText}>
            {isSubmitting ? 'Đang đăng...' : 'Đăng công thức'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddScreen;