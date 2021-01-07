<?php
/**
 * Single Product Image
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/single-product/product-image.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see     https://docs.woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 3.5.1
 */

defined( 'ABSPATH' ) || exit;

// Note: `wc_get_gallery_image_html` was added in WC 3.3.2 and did not exist prior. This check protects against theme overrides being used on older versions of WC.
if ( ! function_exists( 'wc_get_gallery_image_html' ) ) {
	return;
}

global $product;
global $img_size_height;
global $img_size_width;

wp_enqueue_script('react');
wp_enqueue_script('react-dom');
wp_enqueue_script('ss-wc-gallery');

$data;

$data['full_images'] = array(
	wp_get_attachment_image_src($product->get_image_id(), 'full'),    
);
foreach ($product->get_gallery_image_ids() as $img) {
	array_push($data['full_images'], wp_get_attachment_image_src($img, 'full'));
}

$data['single_images'] = array(
	wp_get_attachment_image_src($product->get_image_id(), 'woocommerce_single'),    
);
foreach ($product->get_gallery_image_ids() as $img) {
	array_push($data['single_images'], wp_get_attachment_image_src($img, 'woocommerce_single'));
}

$data['thumb_images'] = array(
	wp_get_attachment_image_src($product->get_image_id(), 'woocommerce_gallery_thumbnail'),    
);
foreach ($product->get_gallery_image_ids() as $img) {
	array_push($data['thumb_images'], wp_get_attachment_image_src($img, 'woocommerce_gallery_thumbnail'));
}

if ($product->get_type() === 'variable') {
	$data['variations'] = [];
	$variations = $product->get_available_variations('objects');
	// error_log(print_r($variations,true));

	foreach ($variations as $prod) {
		// return;
		$var_image = $prod->get_image_id();
		$data['variations'][] = array(
			'id' => $var_image,
			'src_full' => wp_get_attachment_image_src($var_image, 'full'),
			'src_single' => wp_get_attachment_image_src($var_image, 'woocommerce_single'),
			'src_thumb' => wp_get_attachment_image_src($var_image, 'woocommerce_gallery_thumbnail'),
		);
	}
}

$data['woocommerce_single'] = array(
	'width' => $img_size_width,
	'height' => $img_size_height
);

$data['html_before_main_gallery'] = apply_filters('sswc_gallery_before_main_gallery', '');

wp_localize_script('ss-wc-gallery', 'ss_wc_gallery', $data);

$columns           = apply_filters( 'woocommerce_product_thumbnails_columns', 4 );
$wrapper_classes   = apply_filters(
	'woocommerce_single_product_image_gallery_classes',
	array(
		'woocommerce-product-gallery',
		'woocommerce-product-gallery--' . ( $product->get_image_id() ? 'with-images' : 'without-images' ),
		'woocommerce-product-gallery--columns-' . absint( $columns ),
		'images',
	)
);
?>

<div id="ss-woocommerce-gallery" class="<?php echo esc_attr( implode( ' ', array_map( 'sanitize_html_class', $wrapper_classes ) ) ); ?>"></div>