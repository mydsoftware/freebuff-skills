<?php
/**
 * Plugin Name: WP AI OS
 * Plugin URI: https://example.com/
 * Description: AI Readiness and AI infrastructure for WordPress.
 * Version: 0.2.0
 * Author: WP AI OS
 * Text Domain: wp-ai-os
 * Domain Path: /languages
 * Requires at least: 6.4
 * Requires PHP: 8.0
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WP_AI_OS_VERSION', '0.2.0' );
define( 'WP_AI_OS_FILE', __FILE__ );
define( 'WP_AI_OS_PATH', plugin_dir_path( __FILE__ ) );
define( 'WP_AI_OS_URL', plugin_dir_url( __FILE__ ) );

require_once WP_AI_OS_PATH . 'admin/class-admin.php';

add_action(
	'plugins_loaded',
	static function () {

		load_plugin_textdomain(
			'wp-ai-os',
			false,
			dirname( plugin_basename( WP_AI_OS_FILE ) ) . '/languages'
		);

		if ( is_admin() ) {
			new WP_AI_OS_Admin();
		}
	}
);
