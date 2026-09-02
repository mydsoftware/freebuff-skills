<?php
/**
 * HTTPS readiness check.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_HTTPS_Check {

	/**
	 * Run check.
	 *
	 * @return WP_AI_OS_Readiness_Result
	 */
	public function run(): WP_AI_OS_Readiness_Result {

		$is_ssl = is_ssl();

		if ( $is_ssl ) {
			return new WP_AI_OS_Readiness_Result(
				'https',
				'HTTPS',
				10,
				10,
				'pass',
				'The website is using HTTPS.',
				''
			);
		}

		return new WP_AI_OS_Readiness_Result(
			'https',
			'HTTPS',
			0,
			10,
			'critical',
			'The website is not using HTTPS.',
			'Enable HTTPS and configure WordPress to use the secure URL.'
		);
	}
}
