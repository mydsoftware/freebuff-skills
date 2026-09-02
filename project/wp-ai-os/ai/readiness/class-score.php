<?php
/**
 * AI Readiness score calculator.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_Readiness_Score {

	/**
	 * Calculate score.
	 *
	 * @param array<int,WP_AI_OS_Readiness_Result> $results Results.
	 * @return int
	 */
	public function calculate( array $results ): int {

		$total     = 0;
		$max_total = 0;

		foreach ( $results as $result ) {
			$total     += $result->score;
			$max_total += $result->max_score;
		}

		if ( 0 === $max_total ) {
			return 0;
		}

		return (int) round(
			( $total / $max_total ) * 100
		);
	}
}
