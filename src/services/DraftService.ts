import { API_BASE_URL } from '@env';
import { TokenManager, ApiException } from './AuthService';
import { CreateRecipePayload, CookingStep, RecipeIngredient } from './RecipeService';

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = `${API_BASE_URL}/api`;
const REQUEST_TIMEOUT = 30000;

// ============================================
// TYPES
// ============================================

export interface DraftLabel {
  id: string;
  name: string;
  colorCode: string;
}

export interface DraftIngredient {
  ingredientId: string;
  name: string;
  quantityGram: number;
}

export interface DraftCookingStepImage {
  id: string;
  imageUrl?: string;
  imageOrder: number;
}

export interface DraftCookingStep {
  id: string;
  instruction: string;
  cookingStepImages: DraftCookingStepImage[];
  stepOrder: number;
}

export interface DraftTaggedUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DraftRecipeResponse {
  id: string;
  name?: string;
  description?: string;
  difficulty: string;
  cookTime: number;
  imageUrl?: string;
  ration?: number;
}

export interface DraftDetailsResponse {
  name: string;
  description?: string;
  difficulty: string;
  cookTime: number;
  imageUrl?: string;
  ration?: number;
  labels: DraftLabel[];
  ingredients: DraftIngredient[];
  cookingSteps: DraftCookingStep[];
  taggedUser: DraftTaggedUser[];
}

export interface DraftRecipeRequest {
  name: string;
  description?: string;
  difficulty: string;
  cookTime: number;
  image?: string; // URI for mobile
  ration?: number;
  labelIds: string[];
  ingredients: RecipeIngredient[];
  cookingSteps: CookingStep[];
  taggedUserIds: string[];
}

// ============================================
// UTILITIES
// ============================================

const validateDraftPayload = (data: DraftRecipeRequest): void => {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Draft name is required');
  }
  if (!data.difficulty) {
    throw new Error('Difficulty is required');
  }
  if (data.cookTime < 0) {
    throw new Error('Cook time must be non-negative');
  }
};

const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([^./?#]+)(?:[?#]|$)/i);
  return match ? match[1] : 'jpg';
};

const getMimeType = (uri: string): string => {
  const ext = getFileExtension(uri).toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  return mimeTypes[ext] || 'image/jpeg';
};

const buildDraftFormData = (data: DraftRecipeRequest): FormData => {
  const formData = new FormData();

  formData.append('Name', data.name);
  formData.append('Difficulty', data.difficulty);
  formData.append('CookTime', String(data.cookTime));

  if (data.description) {
    formData.append('Description', data.description);
  }

  if (data.ration) {
    formData.append('Ration', String(data.ration));
  }

  if (data.image && data.image.trim().length > 0) {
    const uri = data.image;
    const filename = uri.split('/').pop() || `draft_image.${getFileExtension(uri)}`;
    const type = getMimeType(uri);
    formData.append('Image', {
      uri,
      name: filename,
      type,
    } as any);
  }

  if (data.labelIds && data.labelIds.length > 0) {
    data.labelIds.forEach((id) => {
      formData.append('LabelIds', id);
    });
  }

  if (data.ingredients && data.ingredients.length > 0) {
    data.ingredients.forEach((ingredient, index) => {
      if (ingredient.ingredientId) {
        formData.append(`Ingredients[${index}].IngredientId`, ingredient.ingredientId);
        formData.append(`Ingredients[${index}].QuantityGram`, String(ingredient.quantityGram));
      }
    });
  }

  if (data.cookingSteps && data.cookingSteps.length > 0) {
    data.cookingSteps.forEach((step, index) => {
      formData.append(`CookingSteps[${index}].StepOrder`, String(step.stepOrder));
      formData.append(`CookingSteps[${index}].Instruction`, step.instruction);
      if (step.images && step.images.length > 0) {
        step.images.forEach((img, imgIndex) => {
          if (img.image && typeof img.image === 'string' && img.image.trim().length > 0) {
            const uri = img.image;
            const filename =
              uri.split('/').pop() || `step_${index}_img_${imgIndex}.${getFileExtension(uri)}`;
            const type = getMimeType(uri);
            formData.append(
              `CookingSteps[${index}].Images[${imgIndex}].Image`,
              {
                uri,
                name: filename,
                type,
              } as any
            );
            formData.append(
              `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
              String(img.imageOrder)
            );
          }
        });
      }
    });
  }

  if (data.taggedUserIds && data.taggedUserIds.length > 0) {
    data.taggedUserIds.forEach((id) => {
      formData.append('TaggedUserIds', id);
    });
  }

  return formData;
};

// ============================================
// HTTP CLIENT
// ============================================

class DraftHttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = REQUEST_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiException('Request timeout', 408);
      }
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (includeAuth) {
      const token = await TokenManager.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await this.fetchWithTimeout(url, { ...options, headers });

      if (response.status === 204) return {} as T;

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw this.handleError(response, responseData);
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      const message = error instanceof Error ? error.message : 'Lỗi kết nối mạng.';
      throw new ApiException(message, 0);
    }
  }

  private handleError(response: Response, responseData: any): ApiException {
    const errorData = responseData as any;
    let errorMessage = errorData.message || `Lỗi ${response.status}: ${response.statusText}`;

    if (errorData.errors) {
      const details = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('\n');
      errorMessage = `Dữ liệu không hợp lệ:\n${details}`;
    }

    return new ApiException(errorMessage, response.status, errorData.errors);
  }
}

const draftHttpClient = new DraftHttpClient(BASE_URL);

// ============================================
// API METHODS
// ============================================

/**
 * Get list of user's draft recipes
 */
export async function getDraftList(): Promise<DraftRecipeResponse[]> {
  return await draftHttpClient.request<DraftRecipeResponse[]>(
    '/Draft',
    { method: 'GET' },
    true
  );
}

/**
 * Get specific draft recipe by ID
 */
export async function getDraftById(draftId: string): Promise<DraftDetailsResponse> {
  if (!draftId) throw new Error('Draft ID is required');

  return await draftHttpClient.request<DraftDetailsResponse>(
    `/Draft/${draftId}`,
    { method: 'GET' },
    true
  );
}

/**
 * Create new draft recipe
 */
export async function createDraft(data: DraftRecipeRequest): Promise<void> {
  validateDraftPayload(data);
  const formData = buildDraftFormData(data);

  await draftHttpClient.request<void>(
    '/Draft',
    { method: 'POST', body: formData },
    true
  );
}

/**
 * Update existing draft recipe
 */
export async function updateDraft(draftId: string, data: DraftRecipeRequest): Promise<void> {
  if (!draftId) throw new Error('Draft ID is required');
  validateDraftPayload(data);
  const formData = buildDraftFormData(data);

  await draftHttpClient.request<void>(
    `/Draft/${draftId}`,
    { method: 'PUT', body: formData },
    true
  );
}

/**
 * Publish a draft recipe - converts the draft to a published recipe
 * Note: Backend automatically deletes the draft after successful recipe creation
 */
export async function publishDraft(
  draftId: string,
  data: CreateRecipePayload,
  existingImageUrl?: string
): Promise<void> {
  if (!draftId) throw new Error('Draft ID is required');

  const formData = new FormData();

  // Required fields
  formData.append('Name', data.name);
  formData.append('Difficulty', data.difficulty);
  formData.append('CookTime', String(data.cookTime));
  formData.append('Ration', String(data.ration));

  // Optional fields
  if (data.description) {
    formData.append('Description', data.description);
  }

  // Image handling
  if (data.image && data.image.trim().length > 0) {
    const uri = data.image;
    const filename = uri.split('/').pop() || `recipe_image.${getFileExtension(uri)}`;
    const type = getMimeType(uri);
    formData.append('Image', {
      uri,
      name: filename,
      type,
    } as any);
  } else if (existingImageUrl) {
    formData.append('ExistingImageUrl', existingImageUrl);
  }

  // Label IDs
  if (data.labelIds && data.labelIds.length > 0) {
    data.labelIds.forEach((id) => {
      formData.append('LabelIds', id);
    });
  }

  // Ingredients
  if (data.ingredients && data.ingredients.length > 0) {
    data.ingredients.forEach((ingredient, index) => {
      if (ingredient.ingredientId) {
        formData.append(`Ingredients[${index}].IngredientId`, ingredient.ingredientId);
        formData.append(`Ingredients[${index}].QuantityGram`, String(ingredient.quantityGram));
      }
    });
  }

  // Cooking steps
  if (data.cookingSteps && data.cookingSteps.length > 0) {
    data.cookingSteps.forEach((step, index) => {
      formData.append(`CookingSteps[${index}].StepOrder`, String(step.stepOrder));
      formData.append(`CookingSteps[${index}].Instruction`, step.instruction);
      if (step.images && step.images.length > 0) {
        step.images.forEach((img, imgIndex) => {
          if (img.image && typeof img.image === 'string' && img.image.trim().length > 0) {
            // New image upload
            const uri = img.image;
            const filename =
              uri.split('/').pop() || `step_${index}_img_${imgIndex}.${getFileExtension(uri)}`;
            const type = getMimeType(uri);
            formData.append(
              `CookingSteps[${index}].Images[${imgIndex}].Image`,
              {
                uri,
                name: filename,
                type,
              } as any
            );
            formData.append(
              `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
              String(img.imageOrder)
            );
          } else if (img.id && img.id.trim().length > 0) {
            // Existing image
            formData.append(`CookingSteps[${index}].Images[${imgIndex}].ExistingImageId`, img.id);
            formData.append(
              `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
              String(img.imageOrder)
            );
          }
        });
      }
    });
  }

  // Tagged user IDs
  if (data.taggedUserIds && data.taggedUserIds.length > 0) {
    data.taggedUserIds.forEach((id) => {
      formData.append('TaggedUserIds', id);
    });
  }

  // Create recipe from draft data (backend will delete draft automatically)
  await draftHttpClient.request<void>(
    '/Recipe',
    { method: 'POST', body: formData },
    true
  );
}

/**
 * Delete a draft recipe
 */
export async function deleteDraft(draftId: string): Promise<void> {
  if (!draftId) throw new Error('Draft ID is required');

  await draftHttpClient.request<void>(
    `/Draft/${draftId}`,
    { method: 'DELETE' },
    true
  );
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  getDraftList,
  getDraftById,
  createDraft,
  updateDraft,
  publishDraft,
  deleteDraft,
};