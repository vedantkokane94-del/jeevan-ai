"""
JEEVAN AI — Simulation Engine
"""

import asyncio
import json
import random
from uuid import uuid4

from app.core.pubsub import pubsub_manager


class FleetSimulator:
    """
    Simulates real-time ambulance movement and traffic delays when real GPS data
    is unavailable, per the Golden Rule.
    """

    def __init__(self):
        self.running = False
        self._task = None
        self.mock_ambulances = [
            {
                "id": str(uuid4()), "vehicle_number": "MH-15-ER-001",
                "lat": 20.0059, "lng": 73.7903, "status": "AVAILABLE",
                "zone": "Ramkund"
            },
            {
                "id": str(uuid4()), "vehicle_number": "MH-15-ER-002",
                "lat": 20.0102, "lng": 73.7850, "status": "EN_ROUTE",
                "zone": "Panchavati"
            },
            {
                "id": str(uuid4()), "vehicle_number": "MH-15-ER-003",
                "lat": 20.0010, "lng": 73.7950, "status": "AT_SCENE",
                "zone": "Godavari Ghat"
            },
        ]

    async def start(self):
        """Start the background simulation loop."""
        if not self.running:
            self.running = True
            self._task = asyncio.create_task(self._simulation_loop())
            print("[Simulator] Started Fleet Simulation Mode")

    async def stop(self):
        """Stop the simulation loop."""
        self.running = False
        if self._task:
            self._task.cancel()

    async def _simulation_loop(self):
        while self.running:
            for amb in self.mock_ambulances:
                # Simulate movement (random jitter)
                if amb["status"] in ["EN_ROUTE", "AVAILABLE", "RETURNING"]:
                    amb["lat"] += random.uniform(-0.001, 0.001)
                    amb["lng"] += random.uniform(-0.001, 0.001)

                # Publish simulated telemetry
                await pubsub_manager.publish(
                    "ambulances:live",
                    json.dumps({
                        "id": amb["id"],
                        "vehicle_number": amb["vehicle_number"],
                        "latitude": amb["lat"],
                        "longitude": amb["lng"],
                        "status": amb["status"],
                        "is_simulated": True
                    })
                )

            await asyncio.sleep(2)  # 2-second telemetry ticks


simulator = FleetSimulator()
