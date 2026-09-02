<?php
/**
 * Content readiness check.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_Content_Check {

	/**
	 * Run check.
	 *
	 * @return WP_AI_OS_Readiness_Result
	 */
	public function run(): WP_AI_OS_Readiness_Result {

		$count = wp_count_posts( 'post' );

		$total = isset( $count->publish ) ? (int) $count->publish : 0;

		if ( $total > 0 ) {
			return new WP_AI_OS_Readiness_Result(
				'content',
				'Content Availability',
				10,
				10,
				'pass',
				sprintf(
					'The website has %d published posts.',
					$total
				),
				''
			);
		}

		return new WP_AI_OS_Readiness_Result(
			'content',
			'Content Availability',
			5,
			10,
			'warning',
			'No published posts were detected.',
			'Publish useful and structured content for AI systems to understand.'
		);
	}
}
