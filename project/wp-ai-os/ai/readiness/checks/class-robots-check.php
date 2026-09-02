<?php
/**
 * Robots.txt readiness check.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_Robots_Check {

	/**
	 * Run check.
	 *
	 * @return WP_AI_OS_Readiness_Result
	 */
	public function run(): WP_AI_OS_Readiness_Result {

		$url = home_url( '/robots.txt' );

		$response = wp_remote_get(
			$url,
			array(
				'timeout'   => 10,
				'sslverify' => true,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new WP_AI_OS_Readiness_Result(
				'robots',
				'robots.txt',
				0,
				10,
				'warning',
				'robots.txt could not be retrieved.',
				'Check your robots.txt configuration.'
			);
		}

		$status = wp_remote_retrieve_response_code( $response );
		$body   = trim( wp_remote_retrieve_body( $response ) );

		if ( 200 !== $status || '' === $body ) {
			return new WP_AI_OS_Readiness_Result(
				'robots',
				'robots.txt',
				0,
				10,
				'warning',
				'robots.txt is missing or unavailable.',
				'Create or configure a valid robots.txt file.'
			);
		}

		return new WP_AI_OS_Readiness_Result(
			'robots',
			'robots.txt',
			10,
			10,
			'pass',
			'robots.txt is available.',
			''
		);
	}
}
