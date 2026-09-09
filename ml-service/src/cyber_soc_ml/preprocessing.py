"""Unfitted preprocessing foundations; fit only on training rows (or CV folds)."""

import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder

from cyber_soc_ml.data import feature_columns, non_finite_counts


def _check_numeric(values):
    if np.isinf(np.asarray(values, dtype=float)).any():
        raise ValueError("Numeric features contain infinity; inspect non-finite values")
    return values


def build_preprocessor(X_train) -> ColumnTransformer:
    """Inspect training schema only; return an unfitted, explicit feature selector.

    Empty training columns are retained. Unknown categories encode as all zeros.
    NaNs are imputed; infinities fail rather than silently changing raw semantics.
    No scaling, feature selection, balancing or test-derived statistics are used.
    """
    categorical, numeric = feature_columns(X_train)
    counts = non_finite_counts(X_train)
    if counts[["positive_infinity", "negative_infinity"]].to_numpy().any():
        raise ValueError("Training numeric features contain infinity")
    return ColumnTransformer(
        [
            ("categorical", Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent", keep_empty_features=True)),
                ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=True)),
            ]), categorical),
            ("numeric", Pipeline([
                ("finite", FunctionTransformer(_check_numeric, feature_names_out="one-to-one")),
                ("imputer", SimpleImputer(strategy="median", keep_empty_features=True)),
            ]), numeric),
        ],
        remainder="drop", sparse_threshold=1.0,
    )
