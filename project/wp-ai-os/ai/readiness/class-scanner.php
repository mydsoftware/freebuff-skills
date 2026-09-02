<?php
/**
 * AI Readiness scanner.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_Readiness_Scanner {

	/**
	 * Checks.
	 *
	 * @var array<int,object>
	 */
	private array $checks = array();

	/**
	 * Constructor.
	 */
	public function __construct() {

		require_once __DIR__ . '/class-result.php';
		require_once __DIR__ . '/class-score.php';

		require_once __DIR__ . '/checks/class-https-check.php';
		require_once __DIR__ . '/checks/class-robots-check.php';
		require_once __DIR__ . '/checks/class-sitemap-check.php';
		require_once __DIR__ . '/checks/class-llms-check.php';
		require_once __DIR__ . '/checks/class-schema-check.php';
		require_once __DIR__ . '/checks/class-rest-check.php';
		require_once __DIR__ . '/checks/class-content-check.php';
		require_once __DIR__ . '/checks/class-ai-bot-check.php';

		$this->checks = array(
			new WP_AI_OS_HTTPS_Check(),
			new WP_AI_OS_Robots_Check(),
			new WP_AI_OS_Sitemap_Check(),
			new WP_AI_OS_LLMs_Check(),
			new WP_AI_OS_Schema_Check(),
			new WP_AI_OS_REST_Check(),
			new WP_AI_OS_Content_Check(),
			new WP_AI_OS_AI_Bot_Check(),
		);
	}

	/**
	 * Run all checks.
	 *
	 * @return array<string,mixed>
	 */
	public function scan(): array {

		$results = array();

		foreach ( $this->checks as $check ) {
			try {
				$result = $check->run();

				if ( $result instanceof WP_AI_OS_Readiness_Result ) {
					$results[] = $result;
				}
			} catch ( Throwable $e ) {
				$results[] = new WP_AI_OS_Readiness_Result(
					'unknown',
					'Unknown Check',
					0,
					10,
					'error',
					'The check failed unexpectedly.',
					''
				);
			}
		}

		$score_calculator = new WP_AI_OS_Readiness_Score();

		return array(
			'score'   => $score_calculator->calculate( $results ),
			'results' => array_map(
				static function ( WP_AI_OS_Readiness_Result $result ) {
					return $result->to_array();
				},
				$results
			),
			'scanned_at' => current_time( 'mysql' ),
		);
	}
}
