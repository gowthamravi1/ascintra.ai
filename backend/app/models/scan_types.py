from enum import Enum
from typing import Dict, List


class ScanType(str, Enum):
    """Enumeration of supported scan types"""
    INVENTORY = "inventory"                    # Asset discovery and inventory
    VULNERABILITY = "vulnerability"            # Security vulnerability scanning
    COMPLIANCE = "compliance"                  # Compliance checking
    BACKUP_VALIDATION = "backup_validation"    # Backup integrity validation
    DRIFT_DETECTION = "drift_detection"        # Configuration drift detection
    COST_OPTIMIZATION = "cost_optimization"    # Cost optimization analysis


class ScanStatus(str, Enum):
    """Enumeration of scan statuses"""
    PENDING = "pending"        # Scan queued, waiting to start
    RUNNING = "running"        # Scan in progress
    COMPLETED = "completed"    # Scan finished successfully
    FAILED = "failed"         # Scan failed with error
    CANCELLED = "cancelled"    # Scan cancelled by user
    PAUSED = "paused"         # Scan paused (for future use)


class ScanPhase(str, Enum):
    """Enumeration of scan phases for progress tracking"""
    INITIALIZING = "initializing"      # Setting up scan environment
    DISCOVERING = "discovering"        # Discovering resources
    ANALYZING = "analyzing"           # Analyzing discovered resources
    MATERIALIZING = "materializing"   # Storing results to database
    FINALIZING = "finalizing"         # Completing scan and cleanup


# Scan type configurations
SCAN_TYPE_CONFIGS: Dict[ScanType, Dict] = {
    ScanType.INVENTORY: {
        "name": "Asset Inventory",
        "description": "Discover and catalog cloud resources",
        "phases": [ScanPhase.INITIALIZING, ScanPhase.DISCOVERING, ScanPhase.MATERIALIZING, ScanPhase.FINALIZING],
        "estimated_duration_minutes": 5,
        "priority": 1
    },
    ScanType.VULNERABILITY: {
        "name": "Vulnerability Scan",
        "description": "Scan for security vulnerabilities",
        "phases": [ScanPhase.INITIALIZING, ScanPhase.DISCOVERING, ScanPhase.ANALYZING, ScanPhase.MATERIALIZING, ScanPhase.FINALIZING],
        "estimated_duration_minutes": 15,
        "priority": 2
    },
    ScanType.COMPLIANCE: {
        "name": "Compliance Check",
        "description": "Verify compliance with standards",
        "phases": [ScanPhase.INITIALIZING, ScanPhase.DISCOVERING, ScanPhase.ANALYZING, ScanPhase.MATERIALIZING, ScanPhase.FINALIZING],
        "estimated_duration_minutes": 10,
        "priority": 3
    },
    ScanType.BACKUP_VALIDATION: {
        "name": "Backup Validation",
        "description": "Validate backup integrity and recoverability",
        "phases": [ScanPhase.INITIALIZING, ScanPhase.DISCOVERING, ScanPhase.ANALYZING, ScanPhase.MATERIALIZING, ScanPhase.FINALIZING],
        "estimated_duration_minutes": 20,
        "priority": 4
    },
    ScanType.DRIFT_DETECTION: {
        "name": "Drift Detection",
        "description": "Detect configuration drift",
        "phases": [ScanPhase.INITIALIZING, ScanPhase.DISCOVERING, ScanPhase.ANALYZING, ScanPhase.MATERIALIZING, ScanPhase.FINALIZING],
        "estimated_duration_minutes": 8,
        "priority": 5
    },
    ScanType.COST_OPTIMIZATION: {
        "name": "Cost Optimization",
        "description": "Analyze costs and suggest optimizations",
        "phases": [ScanPhase.INITIALIZING, ScanPhase.DISCOVERING, ScanPhase.ANALYZING, ScanPhase.MATERIALIZING, ScanPhase.FINALIZING],
        "estimated_duration_minutes": 12,
        "priority": 6
    }
}


def get_scan_phases(scan_type: ScanType) -> List[ScanPhase]:
    """Get the phases for a specific scan type"""
    return SCAN_TYPE_CONFIGS[scan_type]["phases"]


def get_phase_progress(phase: ScanPhase, total_phases: int) -> int:
    """Calculate progress percentage for a given phase"""
    phase_index = list(ScanPhase).index(phase)
    return int((phase_index / (total_phases - 1)) * 100)


def get_scan_config(scan_type: ScanType) -> Dict:
    """Get configuration for a specific scan type"""
    return SCAN_TYPE_CONFIGS[scan_type]
