<?php
/**
 * WordPress REST API readiness check.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_REST_Check {

	/**
	 * Run check.
	 *
	 * @return WP_AI_OS_Readiness_Result
	 */
	public function run(): WP_AI_OS_Readiness_Result {

		$response = wp_remote_get(
			rest_url(),
			array(
				'timeout'   => 10,
				'sslverify' => true,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new WP_AI_OS_Readiness_Result(
				'rest',
				'WordPress REST API',
				0,
				10,
				'critical',
				'The WordPress REST API could not be reached.',
				'Make sure the REST API is enabled and accessible.'
			);
		}

		$status = wp_remote_retrieve_response_code( $response );

		if ( 200 === $status ) {
			return new WP_AI_OS_Readiness_Result(
				'rest',
				'WordPress REST API',
				10,
				10,
				'pass',
				'The WordPress REST API is accessible.',
				''
			);
		}

		return new WP_AI_OS_Readiness_Result(
			'rest',
			'WordPress REST API',
			0,
			10,
			'warning',
			'The WordPress REST API returned an unexpected response.',
			'Check REST API restrictions and security plugins.'
		);
	}
}
