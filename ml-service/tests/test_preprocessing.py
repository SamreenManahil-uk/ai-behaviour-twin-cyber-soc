"""Verify imputation and category learning never consume held-out rows."""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from scipy import sparse
from sklearn.exceptions import NotFittedError

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from cyber_soc_ml.preprocessing import build_preprocessor


def test_training_only_statistics_and_unseen_missing_test_values():
    train = pd.DataFrame({"bytes": [1., 3., np.nan], "proto": ["tcp", "udp", np.nan]})
    test = pd.DataFrame({"bytes": [1000., np.nan], "proto": ["unseen", np.nan]})
    before = train.copy(deep=True)
    transformer = build_preprocessor(train)
    with pytest.raises(NotFittedError):
        transformer.transform(test)
    transformed_train = transformer.fit_transform(train)
    transformed_test = transformer.transform(test)
    assert sparse.issparse(transformed_train)
    assert sparse.issparse(transformed_test)
    np.testing.assert_allclose(transformed_test.toarray(), [[0, 0, 1000], [1, 0, 2]])
    numeric = transformer.named_transformers_["numeric"].named_steps["imputer"]
    np.testing.assert_allclose(numeric.statistics_, [2])
    categorical = transformer.named_transformers_["categorical"].named_steps
    assert categorical["imputer"].statistics_.tolist() == ["tcp"]
    assert categorical["encoder"].categories_[0].tolist() == ["tcp", "udp"]
    pd.testing.assert_frame_equal(train, before)


@pytest.mark.parametrize("column", ["id", "label", "attack_cat"])
def test_reject_leakage_and_identifier(column):
    with pytest.raises(ValueError, match="must exclude"):
        build_preprocessor(pd.DataFrame({"bytes": [1], column: [1]}))


def test_infinities_fail_in_training_and_testing():
    with pytest.raises(ValueError, match="infinity"):
        build_preprocessor(pd.DataFrame({"bytes": [np.inf]}))
    transformer = build_preprocessor(pd.DataFrame({"bytes": [1.]}))
    transformer.fit(pd.DataFrame({"bytes": [1.]}))
    with pytest.raises(ValueError, match="infinity"):
        transformer.transform(pd.DataFrame({"bytes": [-np.inf]}))
