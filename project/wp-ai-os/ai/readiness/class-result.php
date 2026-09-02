<?php
/**
 * AI Readiness Check Result.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_AI_OS_Readiness_Result {

	/**
	 * Check identifier.
	 *
	 * @var string
	 */
	public string $id;

	/**
	 * Check title.
	 *
	 * @var string
	 */
	public string $title;

	/**
	 * Score.
	 *
	 * @var int
	 */
	public int $score;

	/**
	 * Maximum score.
	 *
	 * @var int
	 */
	public int $max_score;

	/**
	 * Status.
	 *
	 * @var string
	 */
	public string $status;

	/**
	 * Message.
	 *
	 * @var string
	 */
	public string $message;

	/**
	 * Recommendation.
	 *
	 * @var string
	 */
	public string $recommendation;

	/**
	 * Constructor.
	 *
	 * @param string $id               Check ID.
	 * @param string $title            Check title.
	 * @param int    $score            Score.
	 * @param int    $max_score        Maximum score.
	 * @param string $status           Status.
	 * @param string $message          Message.
	 * @param string $recommendation   Recommendation.
	 */
	public function __construct(
		string $id,
		string $title,
		int $score,
		int $max_score,
		string $status,
		string $message,
		string $recommendation = ''
	) {
		$this->id             = $id;
		$this->title          = $title;
		$this->score          = max( 0, $score );
		$this->max_score      = max( 0, $max_score );
		$this->status         = $status;
		$this->message        = $message;
		$this->recommendation = $recommendation;
	}

	/**
	 * Convert result to array.
	 *
	 * @return array<string,mixed>
	 */
	public function to_array(): array {
		return array(
			'id'             => $this->id,
			'title'          => $this->title,
			'score'          => $this->score,
			'max_score'      => $this->max_score,
			'status'         => $this->status,
			'message'        => $this->message,
			'recommendation' => $this->recommendation,
		);
	}
}
