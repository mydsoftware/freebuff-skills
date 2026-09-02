<?php
/**
 * llms.txt readiness check.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_LLMs_Check {

	/**
	 * Run check.
	 *
	 * @return WP_AI_OS_Readiness_Result
	 */
	public function run(): WP_AI_OS_Readiness_Result {

		$url = home_url( '/llms.txt' );

		$response = wp_remote_get(
			$url,
			array(
				'timeout'   => 10,
				'sslverify' => true,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new WP_AI_OS_Readiness_Result(
				'llms',
				'llms.txt',
				0,
				10,
				'warning',
				'llms.txt could not be retrieved.',
				'Create an AI-friendly llms.txt file.'
			);
		}

		$status = wp_remote_retrieve_response_code( $response );
		$body   = trim( wp_remote_retrieve_body( $response ) );

		if ( 200 === $status && '' !== $body ) {
			return new WP_AI_OS_Readiness_Result(
				'llms',
				'llms.txt',
				10,
				10,
				'pass',
				'llms.txt is available.',
				''
			);
		}

		return new WP_AI_OS_Readiness_Result(
			'llms',
			'llms.txt',
			0,
			10,
			'warning',
			'llms.txt was not detected.',
			'Enable llms.txt to provide structured information to AI systems.'
		);
	}
}
