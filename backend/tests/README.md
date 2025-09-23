# Ascintra Backend Tests

This directory contains all test files and debug scripts for the Ascintra backend.

## Directory Structure

```
tests/
├── __init__.py
├── README.md
├── integration/          # Integration tests
│   ├── __init__.py
│   ├── test_materialization.py
│   ├── test_materialization_debug.py
│   └── test_simple_materialization.py
├── unit/                 # Unit tests
│   ├── __init__.py
│   ├── test_aql_simple.py
│   ├── test_ec2_document.py
│   ├── test_fixes.py
│   └── test_minimal.py
└── debug/                # Debug and utility scripts
    ├── __init__.py
    ├── check_arango.py
    └── debug_aql.py
```

## Test Categories

### Integration Tests (`integration/`)
- **test_materialization.py**: Tests the full materialization process
- **test_materialization_debug.py**: Debug version of materialization tests
- **test_simple_materialization.py**: Simplified materialization tests

### Unit Tests (`unit/`)
- **test_aql_simple.py**: Tests AQL query execution
- **test_ec2_document.py**: Tests EC2 document processing
- **test_fixes.py**: Tests various fixes and patches
- **test_minimal.py**: Minimal test cases

### Debug Scripts (`debug/`)
- **check_arango.py**: ArangoDB connection and data checking
- **debug_aql.py**: AQL query debugging

## Running Tests

### From the backend directory:
```bash
# Run all tests
python -m pytest tests/

# Run integration tests only
python -m pytest tests/integration/

# Run unit tests only
python -m pytest tests/unit/

# Run specific test file
python -m pytest tests/integration/test_materialization.py
```

### From the project root:
```bash
# Run tests in Docker container
docker-compose exec backend python -m pytest tests/

# Run specific test
docker-compose exec backend python -m pytest tests/integration/test_materialization.py
```

## Debug Scripts

Debug scripts can be run directly:
```bash
# Check ArangoDB connection
python tests/debug/check_arango.py

# Debug AQL queries
python tests/debug/debug_aql.py
```

## Notes

- All test files were moved from the project root to this organized structure
- Tests are organized by type (integration, unit, debug) for better maintainability
- Each subdirectory has its own `__init__.py` file for proper Python package structure
