<?php
/**
 * Sitemap readiness check.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_Sitemap_Check {

	/**
	 * Run check.
	 *
	 * @return WP_AI_OS_Readiness_Result
	 */
	public function run(): WP_AI_OS_Readiness_Result {

		$candidates = array(
			home_url( '/wp-sitemap.xml' ),
			home_url( '/sitemap_index.xml' ),
		);

		foreach ( $candidates as $url ) {

			$response = wp_remote_get(
				$url,
				array(
					'timeout'   => 10,
					'sslverify' => true,
				)
			);

			if ( is_wp_error( $response ) ) {
				continue;
			}

			$status = wp_remote_retrieve_response_code( $response );

			if ( 200 === $status ) {
				return new WP_AI_OS_Readiness_Result(
					'sitemap',
					'XML Sitemap',
					10,
					10,
					'pass',
					'An XML sitemap is available.',
					''
				);
			}
		}

		return new WP_AI_OS_Readiness_Result(
			'sitemap',
			'XML Sitemap',
			0,
			10,
			'warning',
			'No accessible XML sitemap was detected.',
			'Enable an XML sitemap for your WordPress website.'
		);
	}
}
