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

add_filter('wc_get_template', 'ss_wc_get_template', 1, 2);
function ss_wc_get_template($template, $template_name) {
  if (is_product() && $template_name === 'single-product/product-image.php') {
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

add_action('after_setup_theme','ss_add_single_image_size');
function ss_add_single_image_size() {
  global $img_size_height;
  global $img_size_width;
	add_image_size('ss_woocommerce_single', $img_size_width, $img_size_height, false);
}
