<?php
/**
 * Plugin Name: SS Woocommerce Gallery
 * Description: SS Woocommerce Gallery
 * Author: supersait
 * Version: 1.0.0
 * License: GPL2+
 * Text Domain: ss
 *
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter('wc_get_template', 'ss_wc_get_template', 1, 5);
function ss_wc_get_template($template, $template_name, $args, $template_path, $default_path) {
  if (is_product() && $template_name === 'single-product/product-image.php') {
    error_log(print_r($template,true));
    error_log(print_r($template_name,true));
    error_log(print_r(trailingslashit( __DIR__.'/product-image.php' ),true));
    return __DIR__.'/product-image.php';
  }
  return $template;
}

if (!in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) && !class_exists('WooCommerce')) {
  return;
}

$img_size_width = 460;
$img_size_height = 472;

add_action('wp_enqueue_scripts', 'ss_wc_enqueue_scripts');
function ss_wc_enqueue_scripts(){
  $suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

  wp_register_script( 'ss-wc-gallery' , plugins_url( 'dist/gallery.wc-react'.$suffix.'.js',  __FILE__ ), array('react','react-dom'), '', true);
}

// add_action('init', 'ss_wc_gallery');
function ss_wc_gallery() {
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

  wp_localize_script('ss-wc-gallery', 'ss_wc_gallery', $data);

  $post_thumbnail_id = $product->get_image_id();
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
  <?php
}

add_action('after_setup_theme','ss_add_single_image_size');
function ss_add_single_image_size() {
  global $img_size_height;
  global $img_size_width;
	add_image_size('ss_woocommerce_single', $img_size_width, $img_size_height, false);
}
