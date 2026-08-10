import { apiRequest } from '../services/api';

// TODO: Ajusta las rutas de estos endpoints cuando tengas definidas las URLs de tu backend Java.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* VIEW V_PRODUCTS_COMPLETE */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
  * Obtener productos por categoría con valores mínimos solo para hompage
  * @param {string} category - 'children' || 'men' || 'women'
  * @returns {Promise<Array>} Array de productos
  */
export const getProductsForHomepage = async (id_category) => {
    try {
        return await apiRequest(`/products/homepage?category=${encodeURIComponent(id_category)}`);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
    }
};

// /**
//   * Obtener productos por categoría para panel del administrador
//   * @param {string} category
//   * @returns {Promise<Array>} Array de productos
//  */
// export const getProductsForAdmin = async (category) => {
//     try {
//         const { data, error } = await supabase
//         .from('v_products_complete')
//         .select('*')
//         .eq('status', 'active') // Tendría que traer incluso los inactivos para que pueda gestionarlos también
//         .eq('category', category)
//         .order('created_at', { ascending: false })

//         if (error) throw error
//         return data
//     } catch (error) {
//         console.error('Error fetching products by category:', error)
//         throw error
//     }
// }

// /**
//   * Obtener talles activos por producto
//   * @param {string} category - 'children' || 'men' || 'women'
//   * @returns {Promise<Array>} Array de productos
//  */
// export const getVariantsBySize = async (id_product) => {
//     try {
//         const { data, error } = await supabase
//         .from('v_variants_by_size')
//         .select(`
//             id_size,
//             size,
//             sort_order,
//             size_description`)
//         // .eq('status', 'A')
//         .eq('id_product', id_product)
//         .order('sort_order', { ascending: true });

//         if (error) throw error;
//         return data || [];
//     } catch (error) {
//         console.error('Error fetching variants by size:', error);
//         throw error;
//     }
// }

/**
 * Obtener información completa del producto para la página de detalle
 * @param {string} productId - UUID del producto
 * @returns {Promise<Object>} Producto con metadata de variantes
 */
export const getProductDetail = async (productId) => {
    try {
        return await apiRequest(`/products/${encodeURIComponent(productId)}`);
    } catch (error) {
        console.error('Error fetching product detail:', error);
        throw error;
    }
};

/**
 * Obtener talles disponibles con sus colores para un producto
 * Cada talle ya viene con available_colors embebido (no hace falta query extra para colores)
 * @param {string} productId - UUID del producto
 * @returns {Promise<Array>} Array de talles con colores anidados
 */
export const getSizesByProduct = async (productId) => {
    try {
        return await apiRequest(`/products/${encodeURIComponent(productId)}/sizes`);
    } catch (error) {
        console.error('Error fetching sizes by product:', error);
        throw error;
    }
};

/**
 * Obtener todos los colores activos para un producto y talle
 * (independientemente del stock)
 * @param {string} productId - UUID del producto
 * @param {number} sizeId - ID del talle
 * @returns {Promise<Array>} Array de colores con info de la variante
 */
export const getColorsByProductAndSize = async (productId, sizeId) => {
    try {
        return await apiRequest(`/products/${encodeURIComponent(productId)}/sizes/${encodeURIComponent(sizeId)}/colors`);
    } catch (error) {
        console.error('Error fetching colors by product and size:', error);
        throw error;
    }
};

/**
 * Obtener imágenes de una variante específica (para carousel)
 * @param {string} variantId - UUID de la variante
 * @returns {Promise<Array>} Array de imágenes ordenadas por order_position
 */
export const getVariantImages = async (variantId) => {
    try {
        return await apiRequest(`/variants/${encodeURIComponent(variantId)}/images`);
    } catch (error) {
        console.error('Error fetching variant images:', error);
        throw error;
    }
};









////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* CONSULTAS SIN VIEWS */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
  * Obtener producto por ID con todas sus imágenes
  * @param {string} productId - UUID del producto
  * @returns {Promise<Object>} Producto con imágenes
 */
export const getProductById = async (productId) => {
    try {
        return await apiRequest(`/products/${encodeURIComponent(productId)}?include=images`);
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

/**
  * Obtener productos por categoría con valores mínimos solo para hompage
  * @returns {Promise<Array>} Array de productos
 */
export const getActiveCategories = async () => {
    try {
        return await apiRequest('/categories?status=active');
    } catch (error) {
        console.error('Error fetching active categories:', error);
        throw error;
    }
};