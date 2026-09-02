<?php
/**
 * Admin functionality.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_Admin {

	/**
	 * Constructor.
	 */
	public function __construct() {

		add_action(
			'admin_menu',
			array( $this, 'register_menu' )
		);

		add_action(
			'admin_enqueue_scripts',
			array( $this, 'enqueue_assets' )
		);
	}

	/**
	 * Register admin menu.
	 *
	 * @return void
	 */
	public function register_menu(): void {

		add_menu_page(
			__( 'WP AI OS', 'wp-ai-os' ),
			__( 'WP AI OS', 'wp-ai-os' ),
			'manage_options',
			'wp-ai-os',
			array( $this, 'render_dashboard' ),
			'dashicons-admin-generic',
			3
		);
	}

	/**
	 * Render dashboard.
	 *
	 * @return void
	 */
	public function render_dashboard(): void {

		require WP_AI_OS_PATH . 'admin/views/dashboard.php';
	}

	/**
	 * Enqueue assets.
	 *
	 * @param string $hook_suffix Admin hook.
	 * @return void
	 */
	public function enqueue_assets( string $hook_suffix ): void {

		if ( 'toplevel_page_wp-ai-os' !== $hook_suffix ) {
			return;
		}

		wp_enqueue_style(
			'wp-ai-os-admin',
			WP_AI_OS_URL . 'assets/css/admin.css',
			array(),
			WP_AI_OS_VERSION
		);

		wp_enqueue_script(
			'wp-ai-os-admin',
			WP_AI_OS_URL . 'assets/js/admin.js',
			array( 'jquery' ),
			WP_AI_OS_VERSION,
			true
		);
	}
}
