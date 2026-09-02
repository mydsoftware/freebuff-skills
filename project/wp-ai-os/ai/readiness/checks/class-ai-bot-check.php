<?php
/**
 * AI bot readiness check.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_AI_Bot_Check {

	/**
	 * Run check.
	 *
	 * @return WP_AI_OS_Readiness_Result
	 */
	public function run(): WP_AI_OS_Readiness_Result {

		$robots_url = home_url( '/robots.txt' );

		$response = wp_remote_get(
			$robots_url,
			array(
				'timeout'   => 10,
				'sslverify' => true,
			)
		);

		if ( is_wp_error( $response ) ) {
			return new WP_AI_OS_Readiness_Result(
				'ai_bots',
				'AI Crawlers',
				0,
				10,
				'warning',
				'AI crawler permissions could not be analyzed.',
				'Check robots.txt manually.'
			);
		}

		$body = strtolower( wp_remote_retrieve_body( $response ) );

		$known_bots = array(
			'gptbot',
			'claudebot',
			'google-extended',
			'perplexitybot',
			'bytespider',
		);

		$blocked = 0;

		foreach ( $known_bots as $bot ) {
			if (
				false !== strpos( $body, 'user-agent: ' . $bot ) &&
				false !== strpos( $body, 'disallow: /' )
			) {
				$blocked++;
			}
		}

		if ( 0 === $blocked ) {
			return new WP_AI_OS_Readiness_Result(
				'ai_bots',
				'AI Crawlers',
				10,
				10,
				'pass',
				'No obvious AI crawler blocks were detected.',
				''
			);
		}

		return new WP_AI_OS_Readiness_Result(
			'ai_bots',
			'AI Crawlers',
			5,
			10,
			'warning',
			sprintf(
				'%d known AI crawler rules may be restricted.',
				$blocked
			),
			'Review robots.txt rules for AI crawlers.'
		);
	}
}
