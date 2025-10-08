#!/usr/bin/env python3
"""Qiskit-backed consensus calculator for the Boardroom of Light simulator."""

from __future__ import annotations

import json
import math
import sys
from dataclasses import dataclass
from typing import Any, Dict

try:
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector
except Exception as exc:  # pragma: no cover - surface import errors as JSON
    print(json.dumps({
        "status": "error",
        "error": (
            "Qiskit import failed. Install qiskit (pip install qiskit) or disable the "
            "quantum plugin."
        ),
        "details": str(exc),
    }))
    sys.exit(1)


@dataclass
class ConsensusConfig:
    participants: int = 5
    entanglement: float = 0.65
    phase_bias: float = 0.25

    @classmethod
    def from_payload(cls, payload: Dict[str, Any]) -> "ConsensusConfig":
        participants = max(2, int(payload.get("participants", cls.participants)))
        entanglement = float(payload.get("entanglement", cls.entanglement))
        entanglement = max(0.0, min(entanglement, 1.0))
        phase_bias = float(payload.get("phaseBias", payload.get("phase_bias", cls.phase_bias)))
        phase_bias = max(0.0, min(phase_bias, 1.0))
        return cls(participants=participants, entanglement=entanglement, phase_bias=phase_bias)


def _build_circuit(config: ConsensusConfig) -> QuantumCircuit:
    qubits = config.participants
    circuit = QuantumCircuit(qubits)
    for idx in range(qubits):
        circuit.h(idx)

    for idx in range(qubits - 1):
        circuit.cx(idx, idx + 1)

    rotation = 2 * math.pi * config.entanglement
    for idx in range(qubits):
        circuit.ry(rotation, idx)

    bias_angle = math.pi * config.phase_bias
    circuit.rx(bias_angle, qubits - 1)
    return circuit


def _probabilities(circuit: QuantumCircuit) -> Dict[str, float]:
    state = Statevector.from_instruction(circuit)
    probs = state.probabilities_dict()
    return {key: float(value) for key, value in probs.items()}


def compute_consensus(payload: Dict[str, Any]) -> Dict[str, Any]:
    config = ConsensusConfig.from_payload(payload)
    circuit = _build_circuit(config)
    probabilities = _probabilities(circuit)

    ordered = sorted(probabilities.items(), key=lambda item: item[1], reverse=True)
    top_states = [
        {"state": state, "probability": prob}
        for state, prob in ordered[:5]
    ]

    coherence = sum(probabilities.values())
    return {
        "participants": config.participants,
        "entanglement": config.entanglement,
        "phaseBias": config.phase_bias,
        "coherence": coherence,
        "topStates": top_states,
    }


def _payload_from_stdin() -> Dict[str, Any]:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON payload: {exc}") from exc


def main() -> None:
    try:
        payload = _payload_from_stdin()
        result = compute_consensus(payload)
    except Exception as exc:  # pragma: no cover - converted to structured error
        print(json.dumps({"status": "error", "error": str(exc)}))
        sys.exit(1)

    print(json.dumps({"status": "ok", "data": result}))


if __name__ == "__main__":
    main()
