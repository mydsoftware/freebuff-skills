<?php
/**
 * Schema readiness check.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_Schema_Check {

	/**
	 * Run check.
	 *
	 * @return WP_AI_OS_Readiness_Result
	 */
	public function run(): WP_AI_OS_Readiness_Result {

		$response = wp_remote_get(
			home_url( '/' ),
			array(
				'timeout'   => 10,
				'sslverify' => true,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new WP_AI_OS_Readiness_Result(
				'schema',
				'Schema.org',
				0,
				10,
				'warning',
				'Homepage could not be inspected.',
				'Check website accessibility.'
			);
		}

		$body = wp_remote_retrieve_body( $response );

		$has_schema = false;

		if ( false !== stripos( $body, 'application/ld+json' ) ) {
			$has_schema = true;
		}

		if ( false !== stripos( $body, 'schema.org' ) ) {
			$has_schema = true;
		}

		if ( $has_schema ) {
			return new WP_AI_OS_Readiness_Result(
				'schema',
				'Schema.org',
				10,
				10,
				'pass',
				'Structured data was detected.',
				''
			);
		}

		return new WP_AI_OS_Readiness_Result(
			'schema',
			'Schema.org',
			0,
			10,
			'warning',
			'No Schema.org structured data was detected on the homepage.',
			'Add valid JSON-LD structured data.'
		);
	}
}
