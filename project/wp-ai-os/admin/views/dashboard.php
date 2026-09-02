<?php
/**
 * AI Readiness Dashboard.
 *
 * @package WP_AI_OS
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once WP_AI_OS_PATH . 'ai/readiness/class-scanner.php';

$scanner = new WP_AI_OS_Readiness_Scanner();
$report  = $scanner->scan();

$score = (int) $report['score'];

?>

<div class="wrap">

	<h1><?php esc_html_e( 'WP AI OS', 'wp-ai-os' ); ?></h1>

	<div class="wp-ai-os-dashboard">

		<div class="wp-ai-os-score-card">

			<h2><?php esc_html_e( 'AI Readiness', 'wp-ai-os' ); ?></h2>

			<div class="wp-ai-os-score">
				<?php echo esc_html( $score ); ?>
				<span>/ 100</span>
			</div>

			<p>
				<?php
				esc_html_e(
					'Website AI readiness score.',
					'wp-ai-os'
				);
				?>
			</p>

		</div>

		<div class="wp-ai-os-checks">

			<h2><?php esc_html_e( 'Checks', 'wp-ai-os' ); ?></h2>

			<table class="widefat striped">

				<thead>
					<tr>
						<th><?php esc_html_e( 'Check', 'wp-ai-os' ); ?></th>
						<th><?php esc_html_e( 'Score', 'wp-ai-os' ); ?></th>
						<th><?php esc_html_e( 'Status', 'wp-ai-os' ); ?></th>
						<th><?php esc_html_e( 'Message', 'wp-ai-os' ); ?></th>
					</tr>
				</thead>

				<tbody>

					<?php foreach ( $report['results'] as $result ) : ?>

						<tr>

							<td>
								<strong>
									<?php echo esc_html( $result['title'] ); ?>
								</strong>
							</td>

							<td>
								<?php
								echo esc_html(
									$result['score'] . '/' . $result['max_score']
								);
								?>
							</td>

							<td>
								<?php echo esc_html( ucfirst( $result['status'] ) ); ?>
							</td>

							<td>
								<?php echo esc_html( $result['message'] ); ?>

								<?php if ( ! empty( $result['recommendation'] ) ) : ?>

									<br>

									<small>
										<strong>
											<?php esc_html_e( 'Recommendation:', 'wp-ai-os' ); ?>
										</strong>

										<?php
										echo esc_html(
											$result['recommendation']
										);
										?>
									</small>

								<?php endif; ?>

							</td>

						</tr>

					<?php endforeach; ?>

				</tbody>

			</table>

		</div>

		<p>
			<small>
				<?php
				printf(
					esc_html__(
						'Last scan: %s',
						'wp-ai-os'
					),
					esc_html( $report['scanned_at'] )
				);
				?>
			</small>
		</p>

	</div>

</div>
