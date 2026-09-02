"""
PACT-OS
Volume Analysis Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class VolumeResult:

    average_volume: float

    current_volume: float

    volume_ratio: float

    high_volume: bool

    status: str


class VolumeEngine:

    def evaluate(
        self,
        volumes: list[float],
    ) -> VolumeResult:

        if not volumes:

            return VolumeResult(

                average_volume=0.0,

                current_volume=0.0,

                volume_ratio=0.0,

                high_volume=False,

                status="NO DATA",
            )

        current_volume = volumes[-1]

        average_volume = (

            sum(volumes)

            / len(volumes)

        )

        if average_volume == 0:

            volume_ratio = 0.0

        else:

            volume_ratio = (

                current_volume

                / average_volume

            )

        high_volume = volume_ratio >= 1.50

        return VolumeResult(

            average_volume=average_volume,

            current_volume=current_volume,

            volume_ratio=volume_ratio,

            high_volume=high_volume,

            status=(

                "HIGH VOLUME"

                if high_volume

                else "NORMAL VOLUME"

            ),
        )