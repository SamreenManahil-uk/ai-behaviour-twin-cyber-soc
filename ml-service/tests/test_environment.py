"""Lightweight dependency checks; no datasets or model training required."""

from importlib import import_module
from importlib.metadata import version

import pytest


@pytest.fixture(autouse=True)
def isolated_plotting_config(tmp_path, monkeypatch):
    """Keep plotting imports headless and their cache inside the test directory."""
    monkeypatch.setenv("MPLBACKEND", "Agg")
    monkeypatch.setenv("MPLCONFIGDIR", str(tmp_path / "matplotlib"))


@pytest.mark.parametrize(
    ("module_name", "distribution"),
    [
        ("numpy", "numpy"),
        ("pandas", "pandas"),
        ("sklearn", "scikit-learn"),
        ("xgboost", "xgboost"),
        ("joblib", "joblib"),
        ("matplotlib", "matplotlib"),
        ("seaborn", "seaborn"),
    ],
)
def test_core_library_import_and_version(module_name, distribution):
    library = import_module(module_name)
    assert library.__version__
    assert library.__version__ == version(distribution)


def test_feature_array_interoperability():
    import numpy as np
    import pandas as pd
    import xgboost as xgb
    from sklearn.preprocessing import normalize

    features = pd.DataFrame({"bytes_in": [3.0, 0.0], "bytes_out": [4.0, 2.0]})
    values = features.to_numpy(dtype=np.float32)
    normalized = normalize(values)
    np.testing.assert_allclose(normalized, [[0.6, 0.8], [0.0, 1.0]])

    matrix = xgb.DMatrix(features)
    assert matrix.num_row() == 2
    assert matrix.num_col() == 2
    assert matrix.feature_names == list(features.columns)
